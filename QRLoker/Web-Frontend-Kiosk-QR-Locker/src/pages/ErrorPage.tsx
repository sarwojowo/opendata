import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error: any = useRouteError();
    console.log(error);

    return (
        <div id="error-page" className="h-[70vh] flex justify-center items-center flex-col w-8/12 mx-auto text-center">
            <span className="font-semibold text-2xl 2xl:text-4xl">Oops! Sorry, an unexpected error has occurred.</span>
            <p className="mt-2 font-normal text-lg 2xl:text-2xl">
                <i>{error.status} {error.statusText || error.message}</i>
            </p>
            <button onClick={() => window.location.reload()} className='py-2 2xl:py-4 w-36 2xl:w-48 2xl:text-2xl bg-cvim-red rounded-full active:bg-cvim-yellow duration-300 text-white mt-5 2xl:mt-8 font-medium'>
                <p>Reload page</p>
            </button>
        </div>
    );
}