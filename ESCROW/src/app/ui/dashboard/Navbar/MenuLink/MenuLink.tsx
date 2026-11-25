import Link from "next/link";
import styles from "./MenuLink.module.css";

export interface MenuItem {
    title: string;
    path: string;
}

export default function MenuLink({ item, onClick }: { item: MenuItem; onClick?: () => void }) {
    return (
        <Link href={item.path} className={styles.container} onClick={onClick}>
            {item.title}
        </Link>
    );
}