import styles from "./art.module.css"

interface Props {
    title: string;
    owner?: string;
    imageUrl?: string;
    profileImageUrl?: string;
    hideOwner?: boolean;
    onClick?: () => void;
}

export default function Art({ title, owner, imageUrl, profileImageUrl, hideOwner, onClick }: Props) {
    return (
        <div className={styles.wrapper} onClick={onClick}>
            <div className={styles.imageSection}>
                <img className={styles.image} src={imageUrl} alt={title} />
            </div>
            <div className={styles.textSection}>
                <p className={styles.title}>{title}</p>
                {!hideOwner && owner && (
                    <div className={styles.ownerRow}>
                        <img
                            className={styles.profilePic}
                            src={profileImageUrl || '/noavatar.png'}
                            alt={owner}
                        />
                        <span className={styles.ownerName}>{owner}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
