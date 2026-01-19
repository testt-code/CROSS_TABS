import { COLORS, AVATARS } from '@/constants/collaborative-session';

export const getRandomColor = (): string => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const getRandomAvatar = (): string => {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

export const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const generateId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const generateDefaultUserName = (): string => {
    return `User ${Math.floor(Math.random() * 1000)}`;
};
