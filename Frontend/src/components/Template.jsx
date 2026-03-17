import {Outlet} from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const Template=()=>{
    return(
        <div className="flex flex-col min-h-screen gap-6">
            <Navbar/>
            <main className="flex-grow flex flex-col gap-6 container mx-auto px-4 py-8">
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );
}

export default Template;