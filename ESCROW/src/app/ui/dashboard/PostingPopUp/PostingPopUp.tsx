import styles from "@/app/ui/dashboard/dashboard.module.css";
import Art from "@/app/ui/dashboard/Art/art";

interface Posting {
    id: number;
    title: string;
    image_url: string | null;
    user: {
        name: string;
    };
}

export default function PostingPopUp( {postings}: {postings: Posting[] } ) {
    return (
        <>
            <div className={styles.service}>
                {postings.map((post:Posting) => (
                    <Art
                        key={post.id}
                        title={post.title}
                        owner={post.user.name}

                        // imageUrl={post.image_url}
                    />
                ))}
            </div>
        </>
    )
}