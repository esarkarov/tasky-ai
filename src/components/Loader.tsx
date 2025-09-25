import { logo } from "@/assets";
import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className='fixed top-0 left-0 z-50 w-full h-[100dvh] bg-background flex flex-col justify-center items-center gap-5'>
      <img
        src={logo}
        width={64}
        height={64}
        alt='Tasky AI'
      />

      <Loader2 className='text-muted-foreground animate-spin' />
    </div>
  );
};
