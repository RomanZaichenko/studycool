interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="flex h-35 w-55 flex-col overflow-hidden rounded-lg bg-white text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {children}
      </div>
      <h3 className="font-victor border-t border-[#B5B2B2] pl-3 text-2xl text-[#5B5757]">
        {title}
      </h3>
    </div>
  );
}
