import styles from './card.module.css'

interface ICard {
    title: string,
    user: string,
    desc: string,
    price: number,
    imageUrl: string,
    profileImageUrl?: string,
    onClick?: () => void;
}

export default function Card({ title, user, desc, price, imageUrl, profileImageUrl, onClick }: ICard) {
    return (
        <div className={styles.wrapper} onClick={onClick}>
            <div className={styles.imageSection}>
                <img className={styles.card} src={imageUrl} alt="card" />
            </div>
            <div className={styles.textSection}>
                <p className={styles.title}>{title}</p>
                <p className={styles.userInfo}>By {user}</p>
                <div className={styles.profilePrice}>
                    <img
                        className={styles.profilePic}
                        src={profileImageUrl || '/noavatar.png'}
                        alt={user}
                    />
                    <span className={styles.price}>{price} ETH</span>
                </div>
            </div>
        </div>
    )
}
