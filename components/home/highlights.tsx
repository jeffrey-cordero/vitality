import Heading from '@/components/home/heading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPaintbrush, faCode, faChartColumn } from '@fortawesome/free-solid-svg-icons';

function Card({ icon, title, description }: { icon: IconProp, title: string, description: string }): JSX.Element {
  return (
    <div className='w-[22rem] min-h-[25rem] text-center rounded-2xl border border-gray-200 bg-white shadow-md hover:cursor-pointer hover:scale-[1.05] transition duration-300 ease-in-out'>
      <div className='flex flex-col text-center justify-center align-center gap-4 py-16 px-12 text-black'>
        <FontAwesomeIcon icon={icon} className='text-4xl text-primary' />
        <h1 className='font-semibold text-3xl text-primary'>{title}</h1>
        <p className='font-medium text-slate-500'>{description}</p>
      </div>

    </div>

  );
}

export default function Highlights(): JSX.Element {
  return (
    <div className='w-full mx-auto mt-8'>
      <Heading
        title='Why Us?'
        description="We've developed a cutting-edge fitness tracker that empowers users to effortlessly monitor their progress, set goals, and achieve optimal fitness levels"
      />
      <div className='flex flex-row flex-wrap gap-20 justify-center align-center my-12'>
        <Card
          icon={faPaintbrush}
          title='Modern Design'
          description='Carefully crafted a precise design, with harmonious typography and perfect padding around every component'
        />
        <Card
          icon={faCode}
          title='Efficiency'
          description='Achieve your goals efficiently and effectively with data-driven insights and a multitude of analytic tools right at your fingertips.'
        />
        <Card
          icon={faChartColumn}
          title='Diversity'
          description='A diverse range of fitness trackers tailored to suit every lifestyle and fitness goal. We’ve got your fitness journey covered'
        />
      </div>
    </div>
  );
}