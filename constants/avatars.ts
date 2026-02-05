export const AVATAR_OPTIONS = [
    { id: 'girl_1' as const, image: require('@/assets/images/avatars/girl_1.png') },
    { id: 'girl_2' as const, image: require('@/assets/images/avatars/girl_2.png') },
    { id: 'boy_1' as const,  image: require('@/assets/images/avatars/boy_1.png') },
    { id: 'boy_2' as const,  image: require('@/assets/images/avatars/boy_2.png') },
  ] as const;
  
  export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];