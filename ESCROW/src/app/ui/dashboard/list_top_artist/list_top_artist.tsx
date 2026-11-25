import styles from "./list_top_artist.module.css";

interface IListart {
    rank: number;
    name: string;
    rating: number;
    totalSales: number;
    profileImage?: string;
}

const MEDAL_COLOR: Record<number, string> = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
};

export default function Listart({ rank, name, rating, totalSales, profileImage }: IListart) {
    const color = MEDAL_COLOR[rank] ?? '#888888';

    return (
        <div className={styles.wrapper} style={{ borderColor: color }}>
            <span className={styles.medal} style={{ background: color }} />
            <img
                className={styles.profileImg}
                src={profileImage || '/noavatar.png'}
                alt={name}
                style={{ borderColor: color }}
            />
            <div className={styles.info}>
                <div className={styles.nameRow}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.rating} style={{ color }}>{rating}/5</span>
                </div>
                <div className={styles.salesRow}>
                    <span className={styles.salesLabel}>Total Sales</span>
                    <span className={styles.salesValue}>{totalSales} ETH</span>
                </div>
            </div>
        </div>
    );
}
