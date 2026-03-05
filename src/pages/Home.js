import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import CollectionCarousel from '../components/CollectionCarousel';
import QuoteBand from '../components/QuoteBand';
import InstagramSection from '../components/InstagramSection';
import Newsletter from '../components/Newsletter';

export default function Home() {
    return (
        <>
            <Hero />
            <About />
            <CollectionCarousel />
            <QuoteBand />
            <InstagramSection />
            <Newsletter />
        </>
    );
}
