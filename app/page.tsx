import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/components/home.module.css';
import Image from 'next/image';
import Header from '@/components/home/header';
import SectionHeading from '@/components/home/section-heading';
import Journey from '@/components/home/journey';

import Card from '@/components/home/card';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
        <div className='w-100 mx-auto'>
          <SectionHeading
            title = "Your Fitness Journey Starts Here"
            description = "Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness"
          />
          <Journey />
        </div>
        <div className='w-100 mx-auto mt-8'>
          <SectionHeading
            title = "Why Us?"
            description = "We've developed a cutting-edge fitness tracker that empowers users to effortlessly monitor their progress, set goals, and achieve optimal fitness levels."
          />

          <div className='flex flex-row gap-12 justify-center align-center my-12'>
            <Card />
            <Card />
            <Card />
          </div>
         
        </div>
        

      </main>
    </>

  );
}
