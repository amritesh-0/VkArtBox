import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export const SOCIAL_LINKS = [
    { label: 'Instagram', href: 'https://www.instagram.com/vk_artbox/', key: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/vkartbox', key: 'facebook' },
    { label: 'YouTube', href: 'https://www.youtube.com/vkartbox', key: 'youtube' },
    { label: 'Pinterest', href: 'https://in.pinterest.com/vkartbox/', key: 'pinterest' }
];

function PinterestIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            <path d="M9.2 21.2c-.5-4 .7-6.9 1.3-9" />
            <path d="M10.8 12.2c-.8-1-1.1-2.4-.8-3.7.4-2 2.2-3.5 4.5-3.5 2.7 0 4.7 1.9 4.7 4.5 0 3.4-1.5 5.9-3.8 5.9-1.2 0-2.1-.9-1.8-2.1l.7-2.7" />
            <path d="M8.8 16.4c-.8.7-1.7 1.1-2.8 1.1-2.1 0-3.7-1.8-3.7-4.5C2.3 7.7 6.1 3 12.1 3 17 3 20.8 6.4 20.8 10.8" />
        </svg>
    );
}

export function SocialIcon({ type, className }) {
    const iconProps = { className, size: 16, strokeWidth: 1.8 };

    switch (type) {
        case 'instagram':
            return <Instagram {...iconProps} />;
        case 'facebook':
            return <Facebook {...iconProps} />;
        case 'youtube':
            return <Youtube {...iconProps} />;
        case 'pinterest':
            return <PinterestIcon className={className} />;
        default:
            return null;
    }
}
