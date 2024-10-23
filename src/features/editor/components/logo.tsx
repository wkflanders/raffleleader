import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
    return (
        <Link href="/">
            <div className="size-20 relative shrink-0">
                <Image src="/logo.svg" alt="logo" fill className="shrink-0 hover:opacity-75 transition"/>
            </div>
        </Link>
    );
}