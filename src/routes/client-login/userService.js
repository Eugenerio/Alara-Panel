import { supabase } from '../../lib/supabaseClient';
import { getCurrentUser, canViewAllUsers, getClientIdForFiltering } from './userUtils';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {number} client_id
 * @property {string} nickname
 * @property {string} platform
 * @property {string} status
 * @property {string} [external_id]
 * @property {string} [name]
 * @property {string} [username]
 * @property {string} [chat_id]
 * @property {string} [role]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} CurrentUserInfo
 * @property {number} id
 * @property {string} name
 * @property {string} [email]
 * @property {'alara_admin'|'user_admin'|'client_admin'} role
 * @property {'panel_admins'|'clients'|'client_users'} table
 * @property {number|null} client_id
 * @property {boolean} canViewAllUsers
 */

/**
 * Отримує користувачів з урахуванням ролі поточного користувача
 * @returns {Promise<User[]>} Масив користувачів
 */
export async function getFilteredUsers() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    console.log('Current user:', currentUser);
    
    try {
        // get all users
        let usersQuery = supabase.from('end_users').select('*');
        
        // If the user is not alara_admin, filter by client_id
        if (!canViewAllUsers(currentUser)) {
            const clientId = getClientIdForFiltering(currentUser);
            
            if (clientId) {
                usersQuery = usersQuery.eq('client_id', clientId);
                console.log(`Filtering users by client_id: ${clientId}`);
            } else {
                console.warn('No client_id found for filtering, returning empty array');
                return [];
            }
        } else {
            console.log('Super admin access - showing all users');
        }
        
        const { data: users, error: usersError } = await usersQuery;
        
        if (usersError) {
            console.error('Error fetching users:', usersError);
            throw usersError;
        }
        
        if (!users || users.length === 0) {
            console.log('No users found');
            return [];
        }
        
        // get last message time for all users in one query
        const userIds = users.map(user => user.id);
        console.log(`Fetching last message times for ${userIds.length} users`);
        
        // use aggregate query to get MAX(time) for each end_user_id
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('end_user_id, time')
            .in('end_user_id', userIds)
            .order('end_user_id')
            .order('time', { ascending: false });
        
        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            // continue without message times, but with a warning
            console.warn('Continuing without message times due to error');
        }
        
        // create a map of last messages (only the first message for each user through ORDER BY)
        const lastMessageMap = new Map();
        if (messagesData) {
            messagesData.forEach(msg => {
                if (!lastMessageMap.has(msg.end_user_id)) {
                    lastMessageMap.set(msg.end_user_id, new Date(msg.time));
                }
            });
        }
        
        // process users with last message time
        const processedUsers = users.map(user => ({
            ...user,
            lastMessageTime: lastMessageMap.get(user.id) || null
        }));
        
        // sort users by priority:
        // 1. Human Required users at the top, sorted by last message time
        // 2. Other users at the bottom, sorted by last message time
        const sortedUsers = processedUsers.sort((a, b) => {
            const aHumanRequired = a.human_required === true;
            const bHumanRequired = b.human_required === true;
            
            // Human Required users always at the top
            if (aHumanRequired && !bHumanRequired) return -1;
            if (!aHumanRequired && bHumanRequired) return 1;
            
            // sort users in the group by last message time (newer first)
            if (a.lastMessageTime && b.lastMessageTime) {
                return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
            }
            
            // users with messages have priority over those without
            if (a.lastMessageTime && !b.lastMessageTime) return -1;
            if (!a.lastMessageTime && b.lastMessageTime) return 1;
            
            // if there are no messages in both, sort by creation date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        console.log(`Fetched ${sortedUsers.length} users with last message times using optimized query`);
        console.log(`Users with messages: ${sortedUsers.filter(u => u.lastMessageTime).length}`);
        console.log(`Human required users: ${sortedUsers.filter(u => u.human_required).length}`);
        
        return sortedUsers;
        
    } catch (error) {
        console.error('Error in getFilteredUsers:', error);
        throw error;
    }
}

/**
 * Отримує інформацію про поточного користувача для відображення в UI
 * @returns {CurrentUserInfo|null}
 */
export function getCurrentUserInfo() {
    const user = getCurrentUser();
    if (!user) return null;
    
    return {
        id: user.id,
        name: user.name,
        email: user.email || undefined,
        role: user.role,
        table: user.table,
        client_id: user.client_id || null,
        canViewAllUsers: canViewAllUsers(user)
    };
}
