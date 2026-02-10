

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white flex flex-col rounded-lg w-55 h-35 text-left 
      overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      <div className="flex-1 flex items-center justify-center overflow-hidden 
        shadow-sm hover:shadow-md transition-shadow">
          
        {children}
      </div>
      <hr className="text-[#333] opacity-20" />
      <h3 className="font-victor text-[#B5B2B2] text-2xl pl-3">{title}</h3>
    </div>
  );
}