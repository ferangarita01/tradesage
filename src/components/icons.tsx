import type { SVGProps } from "react";

export function BitcoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.767 19.089c4.924-1.102 7.015-6.049 4.924-10.37a5.5 5.5 0 0 0-8.638-2.316 5.5 5.5 0 0 0-2.316 8.638c2.09 4.32 7.015 9.267 6.03 1.102z" />
      <path d="M8 6h4.5a2.5 2.5 0 0 1 0 5H8" />
      <path d="M8 11h4.5a2.5 2.5 0 0 1 0 5H8" />
      <path d="M12 4v2" />
      <path d="M12 16v2" />
    </svg>
  );
}

export function EthereumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7.422 7.5-7.422 3L4.578 10.5 12 3z" />
      <path d="M12 12.5l7.422 7.5L12 21l-7.422-1-7.422-7.5 7.422-1z" />
    </svg>
  );
}
