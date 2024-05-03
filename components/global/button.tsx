import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, type, ...rest }: ButtonProps): JSX.Element {
  return (
    <button
      type={type ?? 'button'}
      {...rest}
      className={clsx(
        'focus:shadow-2xl focus:ring-slate-200 font-bold rounded-lg text-md px-4 py-2 outline-none hover:cursor-pointer hover:scale-[1.05] transition duration-300 ease-in-out',
        className,
      )}
    >
      {children}
    </button>
  );
}
