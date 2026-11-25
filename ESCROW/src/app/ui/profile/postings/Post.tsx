import styles from "./post.module.css";

interface Props {
    title: string;
    imageUrl?: string;
    onClick?: () => void;
}

export default function Posts ({title, imageUrl, onClick}:Props){
    // const displayImage = imageUrl || "/train.png"

    return (
        <div className={styles.wrapper} onClick={onClick}>
            <div className={styles.imageContainer}>
                <img src={imageUrl} alt={title} className={styles.image} />
            </div>
            <div className={styles.context}>
                <div className={styles.title}>
                    <p>{title}</p>
                </div>
            </div>
        </div>
    )
}