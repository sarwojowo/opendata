"use client"

import AsyncSelect from "react-select/async";
import styles from './navbar.module.css'
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import MenuLink from "@/app/ui/dashboard/Navbar/MenuLink/MenuLink";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { SiweMessage } from "siwe";
import { BrowserProvider } from "ethers";
import { useChat } from "@/app/ui/chat/ChatProvider";
import axios from "axios";
import { IoMdChatbubbles } from "react-icons/io";
import Skeleton from "@/app/ui/components/Skeleton";

export default function Navbar (){
    const [isOpen, setIsOpen] = useState(false);
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isCreator, setIsCreator] = useState<boolean | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { switchRoom } = useChat();

    // Sync input value with URL search param
    useEffect(() => {
        const search = searchParams.get("search");
        if (search) setInputValue(search);
    }, [searchParams]);

    const toggle = () => {
        setIsOpen(prev => !prev);
        setIsChatMenuOpen(false);
    };

    const toggleChat = () => {
        setIsChatMenuOpen(prev => !prev);
        setIsOpen(false);
    };

    // Fetch chat rooms for history dropdown
    useEffect(() => {
        const fetchRooms = async () => {
            if (session?.user?.id) {
                try {
                    const res = await axios.get("/api/chat");
                    setChatRooms(res.data);
                } catch (err) {
                    console.error("Error fetching chat rooms:", err);
                }
            }
        };
        fetchRooms();
    }, [session?.user?.id, isChatMenuOpen]);

    const handleChatRoomClick = (room: any) => {
        switchRoom(room);
        setIsChatMenuOpen(false);
    };

    const ARBITER_ADDRESS = process.env.NEXT_PUBLIC_ARBITER_ADDRESS?.toLowerCase();

    const wallet = session?.user?.wallet?.toLowerCase();

    const isArbiter =
    wallet && ARBITER_ADDRESS && wallet === ARBITER_ADDRESS;


    // Check creator status when user is logged in
    useEffect(() => {
        const checkCreatorStatus = async () => {
            if (session?.user?.wallet) {
                try {
                    const response = await fetch(`/api/users/${session.user.wallet}?includeCreatorStatus=true`);
                    if (response.ok) {
                        const data = await response.json();
                        setIsCreator(data.isCreator);
                    }
                } catch (error) {
                    console.error('Error checking creator status:', error);
                    setIsCreator(false);
                }
            } else {
                setIsCreator(null);
            }
        };

        checkCreatorStatus();
    }, [session?.user?.wallet]);

    useEffect(() => {
        if (!session?.user?.wallet) {
            setProfileImageUrl(null);
            return;
        }
        fetch('/api/settings')
            .then((res) => res.ok ? res.json() : null)
            .then((data) => setProfileImageUrl(data?.profile_image_url ?? null))
            .catch(() => setProfileImageUrl(null));
    }, [session?.user?.wallet]);

    // Dynamic menu items based on creator status
    const menuItems = useMemo(() => {
        const profilePath = session?.user?.id ? `/profile/${session.user.id}` : "/profile";
        const baseItems = [
            { title: "Profile", path: profilePath },
            isCreator === false 
                ? { title: "Become an Artist", path: "/become-artist" }
                : { title: "Artist Dashboard", path: "/dashboard" },
            { title: "Settings", path: "/settings" },
            { title: "My Orders", path: "/orders" }
        ];

        if (isArbiter) {
            baseItems.push({
                title: "Arbiter",
                path: "/arbiter"
            })
        }
        return baseItems;
    }, [isCreator, session?.user?.id, isArbiter]);

    const loadOptions = async (inputValue: string) => {
        if (!inputValue) return [];
        try {
            const response = await fetch(`/api/users?search=${inputValue}`);
            if (response.ok) {
                const data = await response.json();
                return data.map((user: any) => ({
                    value: user.id.toString(),
                    label: user.name || user.wallet,
                    image: user.profile_image_url || "/noavatar.png",
                    type: "user"
                }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        return [];
    };

    const formatOptionLabel = ({ label, image }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
                src={image} 
                alt={label} 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span>{label}</span>
        </div>
    );

    const handleSearchChange = (option: any) => {
        if (option && option.type === "user") {
            router.push(`/profile/${option.value}`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && inputValue) {
            event.preventDefault();
            router.push(`/?search=${encodeURIComponent(inputValue)}`);
        }
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            if (!(window as any).ethereum) {
                alert("MetaMask not found! Please install MetaMask.");
                setIsConnecting(false);
                return;
            }

            // Request account access
            const provider = new BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress(); // Keep checksummed for SIWE
            const chainId = (await provider.getNetwork()).chainId;
            console.log(address)

            // Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: "Sign in to PixelHub with Ethereum",
                uri: window.location.origin,
                version: "1",
                chainId: Number(chainId),
                nonce: Math.random().toString(36).substring(2),
            });

            const preparedMessage = message.prepareMessage();

            // Request signature
            const signature = await signer.signMessage(preparedMessage);

            // Sign in with NextAuth
            const result = await signIn("credentials", {
                message: JSON.stringify(message),
                signature,
                redirect: false,
            });

            if (result?.error) {
                alert("Authentication failed. Please try again.");
            } else if (result?.ok) {
                // Check if user needs to create profile
                const userRes = await fetch(`/api/users/${address.toLowerCase()}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (!userData.name) {
                        router.push("/edit/create-profile");
                    } else {
                        router.push("/");
                    }
                }
            }
        } catch (err: any) {
            console.error("Wallet connection error:", err);
            if (err.code === 4001) {
                alert("You rejected the signature request");
            } else {
                alert("Failed to connect wallet. Please try again.");
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    return(
        <div className={styles.wrapper}>
            <div className={styles.leftside}>
                <div className={styles.logo}>
                    <Link href="/">
                        <span className={styles.logoText}>PIXELHUB</span>
                    </Link>
                </div>
                <nav className={styles.navLinks}>
                    <Link href="/#top-artist" className={styles.navLink}>Top Artist</Link>
                    <Link href="/#art-commission" className={styles.navLink}>Art / Commission</Link>
                    <Link href="/#content" className={styles.navLink}>Content</Link>
                </nav>
            </div>

            <div className={styles.center}>
                <div className={styles.search}>
                    <AsyncSelect 
                        cacheOptions
                        defaultOptions
                        loadOptions={loadOptions}
                        formatOptionLabel={formatOptionLabel}
                        onInputChange={(newValue) => setInputValue(newValue)}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search users or art..."
                        noOptionsMessage={({ inputValue }) => 
                            inputValue ? `Search for "${inputValue}" in Art/Services (Enter)` : "Start typing to search users..."
                        }
                        components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                        }}
                        styles={{
                            control: (base) => ({
                                ...base,
                                background: "#272727",
                                border: "1px solid rgba(255,255,255,0.12)",
                                boxShadow: "none",
                                borderRadius: "8px",
                                minHeight: "36px",
                                height: "36px",
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: "0 10px",
                            }),
                            input: (base) => ({
                                ...base,
                                color: "#fff",
                                margin: 0,
                                padding: 0,
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: "#fff",
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: "rgba(255,255,255,0.4)",
                                fontSize: "13px",
                            }),
                            menu: (base) => ({
                                ...base,
                                background: "#1e1e1e",
                                borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                zIndex: 1001,
                            }),
                            option: (base, state) => ({
                                ...base,
                                background: state.isFocused ? "#333" : "transparent",
                                color: "#fff",
                                fontSize: "13px",
                                "&:active": {
                                    background: "#444",
                                }
                            })
                        }}
                    />
                </div>
            </div>

            <div className={styles.rightside}>
                {status === "loading" ? (
                    <button className={styles.connectBtn} disabled>
                        Loading...
                    </button>
                ) : !session ? (
                    <button
                        onClick={connectWallet}
                        className={styles.connectBtn}
                        disabled={isConnecting}
                    >
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </button>
                ) : (
                    <>
                        <button 
                            className={styles.chatIconBtn}
                            onClick={toggleChat}
                        >
                            <IoMdChatbubbles size={24} color="white" />
                        </button>

                        {isChatMenuOpen && (
                            <div className={styles.chatDropdown}>
                                <h3>Recent Chats</h3>
                                <hr />
                                {chatRooms.length === 0 ? (
                                    <p className={styles.noChat}>No recent chats</p>
                                ) : (
                                    <ul className={styles.chatList}>
                                        {chatRooms.map((room) => {
                                            const others = (room.participants ?? []).filter(
                                                (p: any) => p.user_id !== session?.user?.id
                                            );
                                            const isGroup = others.length > 1;
                                            const displayName = isGroup
                                                ? others.map((p: any) => p.user?.name || "User").join(", ")
                                                : others[0]?.user?.name || "User";
                                            const displayImage = isGroup
                                                ? "/noavatar.png"
                                                : others[0]?.user?.profile_image_url || "/noavatar.png";
                                            return (
                                                <li
                                                    key={room.id}
                                                    onClick={() => handleChatRoomClick(room)}
                                                >
                                                    <img src={displayImage} alt="profile" />
                                                    <div className={styles.chatInfo}>
                                                        <span className={styles.chatName}>{displayName}</span>
                                                        <span className={styles.chatLastMsg}>
                                                            {room.messages[0]?.content || "No messages yet"}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}

                        <span className={styles.walletAddress}>
                            {session.user.wallet.slice(0, 6)}...{session.user.wallet.slice(-4)}
                        </span>
                        <button
                            onClick={handleLogout}
                            className={styles.connectBtn}
                        >
                            Logout
                        </button>
                    </>
                )}

                <div
                    className={styles.profile}
                    onClick={toggle}
                >
                    {status === "loading" ? (
                        <Skeleton variant="circle" width={40} height={40} />
                    ) : (
                        <img src={profileImageUrl || "/noavatar.png"} alt="Profile"/>
                    )}
                </div>

                {isOpen && session && (
                    <ul className={styles.Menu} >
                        {menuItems.map((item) => (
                            <li key={item.title}>
                                <MenuLink item={item} onClick={() => setIsOpen(false)}/>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
