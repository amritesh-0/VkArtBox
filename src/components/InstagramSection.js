import React, { useEffect, useRef } from 'react';
import './InstagramSection.css';

// Import local assets
import profilePic from '../assets/insta_profile.png';
import post1 from '../assets/insta_post_1.png';
import post2 from '../assets/insta_post_2.png';
import post3 from '../assets/insta_post_3.png';
import post4 from '../assets/insta_post_4.png';
import post5 from '../assets/insta_post_5.png';
import post6 from '../assets/insta_post_6.png';

const INSTA_POSTS = [
    { id: 1, url: post1 },
    { id: 2, url: post2 },
    { id: 3, url: post3 },
    { id: 4, url: post4 },
    { id: 5, url: post5 },
    { id: 6, url: post6 },
];

export default function InstagramSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const els = sectionRef.current?.querySelectorAll('.reveal');
        if (!els) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section className="insta" id="instagram" ref={sectionRef}>
            <div className="insta__inner">
                <div className="section-header reveal">
                    <div className="section-eyebrow">Connect</div>
                    <h2 className="section-title">On <em>Instagram</em></h2>
                </div>

                <div className="insta__profile reveal reveal-delay-1">
                    <div className="insta__profile-left">
                        <div className="insta__avatar-wrapper">
                            <img
                                src={profilePic}
                                alt="VK ArtBox Profile"
                                className="insta__avatar"
                            />
                            <div className="insta__avatar-ring"></div>
                        </div>
                    </div>
                    <div className="insta__profile-right">
                        <div className="insta__profile-header">
                            <h3 className="insta__username">vk_artbox</h3>
                            <a href="https://www.instagram.com/vk_artbox/" target="_blank" rel="noopener noreferrer" className="insta__follow-btn btn-gold">
                                Follow
                            </a>
                        </div>
                        <div className="insta__stats">
                            <div className="insta__stat"><strong>660</strong> posts</div>
                            <div className="insta__stat"><strong>1M</strong> followers</div>
                            <div className="insta__stat"><strong>30</strong> following</div>
                        </div>
                        <div className="insta__bio">
                            <p className="insta__name">Artist | Influencer | YouTuber</p>
                            <p className="insta__desc">
                                Follow to be Part of Our Family.
                                <br />
                                YouTube channel:
                                {' '}
                                <a href="https://www.youtube.com/c/VKArtBox" target="_blank" rel="noopener noreferrer">
                                    https://www.youtube.com/c/VKArtBox
                                </a>
                                <br />
                                Contact us: mail@vkartbox.com
                            </p>
                        </div>
                    </div>
                </div>

                <div className="insta__grid">
                    {INSTA_POSTS.map((post, i) => (
                        <div key={post.id} className={`insta__post reveal reveal-delay-${(i % 4) + 1}`}>
                            <a href="https://www.instagram.com/vk_artbox/" target="_blank" rel="noopener noreferrer" className="insta__post-link">
                                <img src={post.url} alt={`Instagram post ${post.id}`} className="insta__post-img" loading="lazy" />
                            </a>
                        </div>
                    ))}
                </div>

                <div className="insta__footer reveal reveal-delay-4">
                    <a href="https://www.instagram.com/vk_artbox/" target="_blank" rel="noopener noreferrer" className="btn-outline">
                        View All On Instagram
                    </a>
                </div>
            </div>
        </section>
    );
}
