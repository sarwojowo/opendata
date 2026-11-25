import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: [
    "/profile/:path*", 
    "/edit/:path*", 
    "/dashboard/:path*", 
    "/settings/:path*",
    "/orders/:path*",
    "/become-artist/:path*"
  ],
};