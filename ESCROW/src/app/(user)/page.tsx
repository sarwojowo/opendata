import styles from '../ui/dashboard/dashboard.module.css'
import Listart from "@/app/ui/dashboard/list_top_artist/list_top_artist";
import Carousel from "@/app/ui/dashboard/Carousel/carousel";
import {fetchService} from "@/lib/ServiceRepository";
import {fetchPostingDashboardWithLikeStatus} from "@/lib/PostingRepository";
import {serializeBigInt} from "@/lib/serializer";
import ServiceGallery from "@/app/ui/dashboard/ServiceGallery";
import ArtGallery from "@/app/ui/dashboard/ArtGallery";
import {getCurrentUser} from "@/lib/getCurrentUser";

export default async function Home ({ searchParams }: { searchParams: Promise<{ search?: string }> }){
    const user = await getCurrentUser();
    const { search } = await searchParams;
    
    // Allow unauthenticated users to view all postings and services
    // Login is required only when interacting with postings (popup)
    const currentUserId = user ? Number(user.id) : null;
    
    const [services, postings] = await Promise.all([
        fetchService(search),
        fetchPostingDashboardWithLikeStatus(currentUserId, search)
    ])

    return (
        <div className={styles.wrapper}>
            {!search && (
                <>
                    {/*Carousel*/}
                    <div className={styles.hero}>
                        {/*Left Side*/}
                        <div className={styles.leftside}>
                            {/*Text Welcome Website*/}
                            <div className={styles.textarea}>
                                <div className={styles.color}>
                                    <p>WELCOME TO PIXELHUB</p>
                                </div>
                                <div className={styles.whitecolor}>
                                    <p>Discover, Collect, and Support</p>
                                </div>
                                <div className={styles.whitecolor}>
                                    <p>Amazing Digital Artist</p>
                                </div>
                            </div>
                            {/*Show off Data*/}
                            <div className={styles.stats}>
                                <div className={styles.statItem}>
                                    <p>12.5K+</p>
                                    <p>ARTWORKS</p>
                                </div>
                                <div className={styles.statItem}>
                                    <p>8.2K+</p>
                                    <p>ARTIST</p>
                                </div>
                                <div className={styles.statItem}>
                                    <p>21.4K+</p>
                                    <p>COLLECTIONS</p>
                                </div>
                            </div>
                        </div>
                        {/*Right Side*/}
                        <div className={styles.rightside}>
                            <Carousel />
                        </div>
                    </div>
                    
                    {/*service section*/}
                    <div id="top-artist">
                        {/*Title for Top Artist*/}
                        <div>
                            <div>
                                <p className={styles.sectionTitle}>Top Artist</p>
                            </div>
                            {/*card for list of top artist*/}
                            <div className={styles.listartist}>
                                <Listart rank={1} name="Alice"   rating={4.9} totalSales={12.4} />
                                <Listart rank={2} name="Angle"  rating={4.8} totalSales={11.4} />
                                <Listart rank={3} name="Budi"    rating={4.7} totalSales={10.8} />
                                <Listart rank={4} name="Sari"    rating={4.6} totalSales={9.3}  />
                                <Listart rank={5} name="Rafi"    rating={4.5} totalSales={8.1}  />
                                <Listart rank={6} name="Dewi"    rating={4.4} totalSales={7.5}  />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/*Headline Before Content*/}
            <div id="art-commission">
                <div>
                    <p className={styles.sectionTitle}>
                        {search ? `Search results for "${search}"` : "Art/Commission"}
                    </p>
                </div>
                
                {/* Service Gallery (Client Component) */}
                <ServiceGallery services={serializeBigInt(services)} />
            </div>

            {/*content post section*/}
            <div id="content">
                <p className={styles.sectionTitle}>Content</p>
                {/* Art Gallery (Client Component) */}
                <ArtGallery postings={serializeBigInt(postings)} />
            </div>
        </div>
    )
}
