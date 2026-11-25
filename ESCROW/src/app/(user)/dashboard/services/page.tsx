"use client"

import styles from './services.module.css'
import {useEffect, useState} from "react";
import axios from "axios";
import {useSession} from "next-auth/react";
import {getCreatorByUserId} from "./actions";


interface IService {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
}

interface ICreator {
    id: number;
    user_id: number | bigint;
    // Add other creator fields as needed
}

export default function ServicesPage () {
    const [user, setUser] = useState<ICreator | null>(null)
    const [services, setServices] = useState<IService[]>([])
    const { data: session, status} = useSession();


    // useEffect(() => {
    //     const did = localStorage.getItem("did")
    //     if (!did) return
    //
    //     const fetchUser = async () => {
    //         const res = await axios.get(`/api/users/${did}`)
    //         setUser(res.data)
    //     }
    //
    //     fetchUser()
    // }, [])

    // Fetch creator data when session is available
    useEffect(() => {
        const checkingUser = async () => {
            if (session?.user) {
                const user_id = session.user.id
                const result = await getCreatorByUserId(parseInt(user_id));
                if (result.success) {
                    setUser(result.data)
                }
            }
        }
        checkingUser();
    }, [session?.user.id]);

    // Fetch services when user/creator data is available
    useEffect(() => {
        if (user?.id) {
            fetchServices(user.id)
        }
    }, [user]);


    const fetchServices = async (creatorId: number) => {
        const servicesRes = await axios.get(`/api/services?creatorId=${creatorId}`);
        setServices(servicesRes.data.data)
    }

    const onDelete = async (id: number) => {
        if (!user?.id) return
        await axios.delete(`/api/services/${id}`) 
        await fetchServices(user.id)
    }
    return (
        <div className={styles.container}>
            <h1>Services Management</h1>
            {/*<p>Manage your services here.</p>*/}
            <div className={styles.button_add}>
                <a href="/dashboard/services/add">
                    <button className={styles.buttonView}>Add</button>
                </a>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {services !== undefined && services.map((service) => (
                        <tr key={service.id}>
                            <td>
                                <div className={styles.service_image}>
                                    <img src={service.image_url ?? ''} alt="service image" height={'40px'} width={'40px'} />
                                </div>
                            </td>
                            <td>{service.name}</td>
                            <td>{service.description}</td>
                            <td>{service.price} ETH</td>
                            <td>
                                <div className={styles.actions}>
                                    <a href={`/dashboard/services/${service.id}`}>
                                        <button className={styles.buttonView}>View</button>
                                    </a>
                                    <button className={styles.buttonDelete} onClick={() => onDelete(service.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}