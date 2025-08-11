import { Link, useNavigate } from "react-router-dom"
import { Avatar } from "./BlogCard"



export const AppBar = () =>{
    const navigate = useNavigate();
    const name = localStorage.getItem("name") || "Anonymous" ;
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    }
    return <div className="border-b flex justify-between px-10 py-4">
        <Link to={'/blogs'} className="flex flex-col justify-center cursor-pointer">
            BlogNest
        </Link>
         <div>
            <Link to={`/publish`}>
                <button type = "button" className="mr-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2">New Blog</button>
            </Link>
            <button onClick={handleLogout} type = "button" className="mr-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2">Logout</button>
            <Avatar size={"big"} name={name}/>
    </div>

    </div>
}  