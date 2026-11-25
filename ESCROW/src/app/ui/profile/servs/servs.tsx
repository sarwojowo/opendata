import styles from "@/app/ui/profile/servs/servs.module.css";

interface ServiceProps {
    title: string;
    desc: string;
    price: number;
    image_url?: string;
    onClick?: () => void;
    onClickBuy?: () => void;
    onClickChat?: () => void;
    hideActions?: boolean;
}

export default function Servs({ title, desc, price, image_url, onClick, onClickBuy, onClickChat, hideActions }: ServiceProps) {
    return (
        <div className={styles.wrapper} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            {/*main title*/}
            <div className={styles.main_title}>{title}</div>

            <div className={styles.box}>
                {/*image*/}
                <img
                    className={styles.card_image}
                    src={image_url}
                    alt={title}
                />
                {/*detail*/}
                <div className={styles.details}>
                    {/*title serv*/}
                    <div className={styles.det_service}>{title}</div>
                    {/*desc*/}
                    <div className={styles.det_desc}>{desc}</div>
                    {/*price*/}
                    <div className={styles.det_price}>{price} ETH</div>
                    {/*button*/}
                    {!hideActions && (
                        <div className={styles.det_button}>
                            <button 
                                className={styles.button_buy} 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card onClick from firing
                                    onClickBuy?.();
                                }}
                            >
                                Buy
                            </button>
                            <button 
                                className={styles.button_chat}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClickChat?.();
                                }}
                            >
                                Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
