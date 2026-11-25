'use client'

import styles from "@/app/ui/dashboard/dashboard.module.css";
import Card from "@/app/ui/dashboard/Card/card";
import {useRef, useState} from "react";
import Modal from "@/app/ui/components/Modal";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import axios from "axios";

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    creator:{
        user:{
            name: string;
        }
    }
}

interface FormValues {
    imageRef: File | null;
    extraNotes: string;
    isSure: boolean;
}

interface ServiceMainPageProps {
    services: Service[];
}

export default function ServiceMainPage({ services }: ServiceMainPageProps) {

    //Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const handleOpenModal = (service: Service) => {
        setIsModalOpen(true);
        setSelectedService(service);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
        setPreviewUrl(null);
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
        try {
            if (!selectedService) return;

            const data = new FormData();
            data.append('serviceId', selectedService.id.toString());
            data.append('extraNotes', values.extraNotes);

            if (values.imageRef) {
                data.append('imageRef', values.imageRef);
            }

            const response = await axios.post('/api/orders', data);
            console.log("Order created:", response.data);

            handleCloseModal();
            alert("Order placed successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const BuyServiceSchema = Yup.object().shape({
        extraNotes: Yup.string().max(500, 'Notes are too long'),
        isSure: Yup.boolean().oneOf([true], 'Required'),
        imageRef: Yup.mixed().required('Reference image is required'),
    });

    return (
        <>
            <div className={styles.service}>
                {services.map((card: Service) => (
                    <Card
                        key={card.id}
                        title={card.name}
                        user={card.creator.user.name}
                        desc={card.description}
                        price={card.price}
                        imageUrl={card.image_url}
                        onClick={() => handleOpenModal(card)}
                    />
                ))}
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedService?.name}
            >
                {selectedService && (
                    <Formik
                        initialValues={{
                            extraNotes: '',
                            imageRef: null,
                            isSure: false
                        }}
                        validationSchema={BuyServiceSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, isValid, dirty, errors, touched }) => (
                            <Form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '400px' }}>
                                {/* Left Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Service Image</label>
                                        <img
                                            src={selectedService.image_url}
                                            alt={selectedService.name}
                                            style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    {previewUrl && (
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Your Reference Image</label>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover', border: '2px solid #f0b90b' }}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{selectedService.description}</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#f0b90b' }}>{selectedService.price} ETH</p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                            Upload Image Reference {errors.imageRef && touched.imageRef && <span style={{color: 'red'}}>*</span>}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.currentTarget.files?.[0] ?? null;
                                                setFieldValue("imageRef", file);

                                                if (previewUrlRef.current) {
                                                    URL.revokeObjectURL(previewUrlRef.current);
                                                }

                                                if (file) {
                                                    const newUrl = URL.createObjectURL(file);
                                                    previewUrlRef.current = newUrl;
                                                    setPreviewUrl(newUrl);
                                                } else {
                                                    previewUrlRef.current = null;
                                                    setPreviewUrl(null);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                backgroundColor: '#222',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        {errors.imageRef && touched.imageRef && (
                                            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.imageRef as string}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                                            Extra Notes
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="extraNotes"
                                            placeholder="Add any special requirements..."
                                            style={{
                                                width: '100%',
                                                height: '100px',
                                                padding: '0.5rem',
                                                backgroundColor: '#222',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '0.9rem',
                                                resize: 'none'
                                            }}
                                        />
                                        {errors.extraNotes && touched.extraNotes && (
                                            <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.extraNotes as string}</div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                                        <Field
                                            type="checkbox"
                                            name="isSure"
                                            id="isSure"
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                        <label htmlFor="isSure" style={{ fontSize: '0.9rem', color: '#ccc', cursor: 'pointer' }}>
                                            I am sure about this purchase
                                        </label>
                                    </div>
                                    {errors.isSure && touched.isSure && (
                                        <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.isSure as string}</div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isValid || !dirty}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                backgroundColor: (isValid && dirty) ? '#f0b90b' : '#333',
                                                color: (isValid && dirty) ? '#000' : '#666',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: (isValid && dirty) ? 'pointer' : 'not-allowed',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Buy Now'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            style={{
                                                flex: 0.5,
                                                padding: '0.75rem',
                                                backgroundColor: 'transparent',
                                                color: '#fff',
                                                border: '1px solid #444',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </Modal>
        </>
    )
}
