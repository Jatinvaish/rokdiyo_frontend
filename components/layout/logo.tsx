import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logos/rokdio__simple.png"
      width={30}
      height={30}
      className="me-1 w-[30px]! h-8! transition-all group-data-collapsible:size-7 group-data-[collapsible=icon]:size-8"
      alt="Rokdio logo"
      unoptimized
    />
  );
}