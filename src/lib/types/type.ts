export interface User {
    id: string;
    client_id: number; // Додано обов'язкове поле
    nickname: string;
    platform: string;
    status: string;
    external_id?: string;
    name?: string;
    username?: string;
    chat_id?: string;
    role?: string;
    created_at?: string;
    [key: string]: any; // для додаткових полів
    alara_status?: boolean;
    human_required?: boolean;
    unreadCount?: number;
    lastMessageTime?: Date;
}

// Додаємо тип для аутентифікованого користувача
export interface AuthUser {
    id: number;
    name: string;
    email?: string;
    role: 'alara_admin' | 'user_admin' | 'client_admin';
    table: 'panel_admins' | 'clients' | 'client_users';
    client_id?: number;
    created_at?: string;
}

// Тип для інформації про поточного користувача
export interface CurrentUserInfo {
    id: number;
    name: string;
    email?: string;
    role: 'alara_admin' | 'user_admin' | 'client_admin';
    table: 'panel_admins' | 'clients' | 'client_users';
    client_id?: number | null;
    canViewAllUsers: boolean;
}


// Тип для адмінів панелі (panel_admins)
export interface PanelAdmin {
    id: number;
    email: string;
    password?: string;
    name?: string;
    role: 'alara_admin';
    created_at?: string;
}

// Тип для клієнтів (clients)
export interface Client {
    id: number;
    name: string;
    status?: string;
    created_at?: string;
    password?: string;
    email?: string;
    role: 'user_admin';
}

// Тип для менеджерів клієнтів (client_users)
export interface ClientUser {
    id: number;
    email?: string;
    password?: string;
    name?: string;
    role: 'client_admin';
    created_at?: string;
    client_id: number; // Обов'язкове поле для зв'язку з клієнтом
}

// Тип для інформації про поточного користувача (для UI)
export interface CurrentUserInfo {
    id: number;
    name: string;
    email?: string;
    role: 'alara_admin' | 'user_admin' | 'client_admin';
    table: 'panel_admins' | 'clients' | 'client_users';
    client_id?: number | null;
    canViewAllUsers: boolean;
}

// Enum для ролей
export enum UserRole {
    alara_admin = 'alara_admin',
    USER_ADMIN = 'user_admin',
    CLIENT_ADMIN = 'client_admin'
}

// Enum для таблиць
export enum UserTable {
    PANEL_ADMINS = 'panel_admins',
    CLIENTS = 'clients',
    CLIENT_USERS = 'client_users'
}

// Enum для статусів користувачів
export enum UserStatus {
    ONGOING = 'on-going',
    OFFLINE = 'offline',
    HUMAN_REQUIRED = 'human-required',
    NO_INFO = 'no-info'
}

// Enum для платформ
export enum Platform {
    WHATSAPP = 'WhatsApp',
    TELEGRAM = 'Telegram',
    INSTAGRAM = 'Instagram'
}

// Тип для конфігурації статусів
export interface StatusConfig {
    color: string;
    label: string;
}

// Тип для маппінгу статусів
export type StatusMapping = Record<string, string>;

// Тип для фільтрів користувачів
export interface UserFilters {
    platform?: Platform | null;
    status?: 'Online' | 'Offline' | 'Human Required' | null;
}


