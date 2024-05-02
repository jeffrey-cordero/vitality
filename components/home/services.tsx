import cx from 'classnames';
import Heading from '@/components/home/heading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { faMugHot } from '@fortawesome/free-solid-svg-icons';
import { faWeightScale } from '@fortawesome/free-solid-svg-icons';
import { faBottleWater } from '@fortawesome/free-solid-svg-icons';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import { faBrain } from '@fortawesome/free-solid-svg-icons';

function Service({ icon, title, background, color, divider }: { icon: IconProp, title: string, background: string, color: string, divider: string }): JSX.Element {
   return (
      <div className={cx(background, color, 'flex flex-col align-center justify-center gap-5 text-center rounded-2xl border border-gray-200 shadow-md p-5 lg:h-[14rem] lg:w-[14rem] w-[13rem] h-[13rem] mx-auto')}>
         <FontAwesomeIcon icon={icon} className={cx(color, 'text-3xl')} />
         <div className={cx(divider, 'w-1/2 mx-auto my-1')} />
         <h1 className='font-semibold text-2xl'>{title}</h1>
      </div>
   )
}

export default function Services(): JSX.Element {

   return (
      <div className='w-full mx-auto my-4'>
         <Heading
            title='Our Services'
            description="With a commitment to innovation, we're constantly exploring new avenues to enhance your wellness experience"
         />
         <div className='grid lg:grid-cols-3 sm:grid-cols-2 xsm:grid-cols-1 gap-6 w-9/12 mx-auto p-5' style={{rowGap: 60}}>
            <Service
               background='bg-white'
               color='text-blue-700'
               icon={faDumbbell}
               title='Workouts'
               divider='bg-blue-700'
            />
            <Service
               background='bg-blue-700'
               color='text-white'
               icon={faMugHot}
               title='Nutrition'
               divider='bg-white'
            />
            <Service
               background='bg-white'
               color='text-blue-700'
               icon={faWeightScale}
               title='Weight'
               divider='bg-blue-700'
            />
            <Service
               background='bg-blue-700'
               color='text-white'
               icon={faBottleWater}
               title='Hydration'
               divider='bg-white'
            />
            <Service
               background='bg-white'
               color='text-blue-700'
               icon={faBullseye}
               title='Goals'
               divider='bg-blue-700'
            />
            <Service
               background='bg-blue-700'
               color='text-white'
               icon={faBrain}
               title='Mood'
               divider='bg-white'
            />
         </div>
      </div>
   );
}