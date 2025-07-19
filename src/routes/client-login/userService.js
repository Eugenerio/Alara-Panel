import { supabase } from '../../lib/supabaseClient';
import { getCurrentUser, canViewAllUsers, getClientIdForFiltering } from './userUtils';
import { PUBLIC_WEB_SERVER } from '$env/static/public';

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
 * Get users with respect to the current user's role
 * @returns {Promise<User[]>} Array of users
 */
export async function getFilteredUsers() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    console.log('Current user:', currentUser);
    
    try {
        // Define client_id for filtering
        let clientId = null;
        
        if (!canViewAllUsers(currentUser)) {
            clientId = getClientIdForFiltering(currentUser);
            
            if (!clientId) {
                console.warn('No client_id found for filtering, returning empty array');
                return [];
            }
        }
        
        console.log(`Loading users via API for client_id: ${clientId}`);
        
        // Use new API endpoint instead of direct Supabase query
        const response = await fetch(`${PUBLIC_WEB_SERVER}/users/${clientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        const users = result.users || [];
        
        console.log(`Fetched ${users.length} users from API with sorting:`, result.sorting);
        
        // API just return them
        return users;
        
    } catch (error) {
        console.error('Error in getFilteredUsers:', error);
        
        // Fallback to Supabase direct query if API is not available    
        console.log('API failed, falling back to Supabase direct query');
        try {
            return await getFilteredUsersFromSupabase();
        } catch (fallbackError) {
            console.error('Fallback to Supabase also failed:', fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Fallback функция для прямого запроса к Supabase
 * @returns {Promise<User[]>} Масив користувачів
 */
async function getFilteredUsersFromSupabase() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    try {
        let query = supabase.from('end_users').select('*');
        
        // Якщо користувач не alara_admin, фільтруємо по client_id
        if (!canViewAllUsers(currentUser)) {
            const clientId = getClientIdForFiltering(currentUser);
            
            if (clientId) {
                query = query.eq('client_id', clientId);
                console.log(`Filtering users by client_id: ${clientId}`);
            } else {
                console.warn('No client_id found for filtering, returning empty array');
                return [];
            }
        } else {
            console.log('Super admin access - showing all users');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} users from Supabase fallback`);
        return data || [];
        
    } catch (error) {
        console.error('Error in getFilteredUsersFromSupabase:', error);
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
