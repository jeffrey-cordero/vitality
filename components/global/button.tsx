import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      {...rest}
      className={clsx(
        " focus:shadow-2xl focus:ring-slate-200 font-bold rounded-lg text-md px-4 lg:px-5 py-2 lg:py-2.5 mr-2 outline-none transition-transform transform hover:scale-105",
        className,
      )}
    >
      {children}
    </button>
  );
}
