import React, { useState } from 'react'
import { useAuth } from '../../../Context/authContext'
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth'
import { Navigate, Link, useNavigate } from 'react-router-dom'

const Register = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const { userLoggedIn } = useAuth()

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isRegistering) {
            setIsRegistering(true)
            await doCreateUserWithEmailAndPassword(email, password)
        }
    }

    return (
        <div class="bg-neutral-800 flex justify-center items-center ">
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
            <main className="w-full  flex self-center place-content-center place-items-center">
            <div>
            <div className="flex items-center justify-center mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 122.879 102.913" >
                            <path d="M11.511,102.894V58.897c-2.339,0.899-4.529,0.919-6.349,0.299 c-1.42-0.479-2.62-1.34-3.5-2.448c-0.88-1.11-1.44-2.461-1.609-3.95c-0.26-2.31,0.43-4.919,2.399-7.37l0,0 c0.1-0.12,0.21-0.24,0.34-0.34L59.847,0.552c0.74-0.679,1.88-0.75,2.701-0.11l57.185,44.457l0,0c0.09,0.069,0.17,0.14,0.249,0.23 c2.65,2.85,3.311,6.009,2.671,8.678c-0.32,1.32-0.95,2.501-1.82,3.481c-0.869,0.979-1.979,1.739-3.24,2.189 c-2,0.72-4.379,0.699-6.789-0.44v43.736h-5.599V56.577c0-1.01-39.228-32.017-43.557-35.386 c-4.59,3.489-44.536,34.247-44.536,35.546v46.176L11.511,102.894L11.511,102.894L11.511,102.894z M38.851,77.96 c2.354,0,4.685,0.434,6.991,1.302l-1.191,6.062L43.61,85.77c-1.042-0.645-2.07-1.152-3.086-1.524 c-1.016-0.372-1.834-0.558-2.454-0.558c-0.57,0-1.023,0.111-1.358,0.335c-0.334,0.223-0.502,0.521-0.502,0.892 c0,0.471,0.254,0.874,0.763,1.209c0.508,0.335,1.357,0.774,2.547,1.319c1.388,0.62,2.528,1.196,3.421,1.73 c0.893,0.532,1.674,1.264,2.343,2.193s1.003,2.076,1.003,3.44c0,1.512-0.415,2.882-1.245,4.108c-0.831,1.227-2.014,2.2-3.551,2.919 c-1.537,0.72-3.322,1.079-5.355,1.079c-2.529,0-5.182-0.472-7.958-1.414l1.079-6.47L30,94.582c1.141,0.868,2.361,1.557,3.663,2.064 s2.386,0.763,3.254,0.763c0.693,0,1.196-0.118,1.506-0.354c0.31-0.235,0.465-0.527,0.465-0.874c0-0.521-0.267-0.96-0.8-1.319 c-0.533-0.36-1.394-0.801-2.585-1.321c-1.363-0.595-2.484-1.158-3.365-1.691c-0.88-0.533-1.643-1.265-2.287-2.194 c-0.644-0.929-0.967-2.076-0.967-3.439c0-1.563,0.421-2.969,1.264-4.221c0.843-1.252,2.021-2.237,3.533-2.956 C35.193,78.319,36.917,77.96,38.851,77.96L38.851,77.96z M56.798,84.469c2.281,0,4.041,0.464,5.281,1.394 c1.239,0.93,1.859,2.263,1.859,3.998c0,0.495-0.05,1.809-0.149,3.941c-0.099,1.885-0.148,2.938-0.148,3.161 c0,0.272,0.043,0.472,0.13,0.595c0.087,0.124,0.217,0.187,0.391,0.187s0.385-0.038,0.632-0.112l0.446,0.372l-0.632,3.719 c-0.917,0.645-2.07,1.017-3.458,1.116c-0.719-0.05-1.357-0.298-1.915-0.744c-0.557-0.447-0.985-1.078-1.283-1.897h-0.26 c-1.091,1.266-2.33,2.157-3.718,2.678c-1.885-0.024-3.391-0.552-4.519-1.58c-1.127-1.028-1.691-2.436-1.691-4.221 c0-2.752,1.425-4.326,4.276-4.723l5.281-0.707v-0.445c0-0.646-0.13-1.104-0.391-1.376c-0.26-0.273-0.713-0.41-1.357-0.41 c-1.389,0-3.186,0.596-5.392,1.786l-0.447-0.298l-0.781-4.574c1.14-0.595,2.398-1.053,3.774-1.376 C54.103,84.629,55.459,84.469,56.798,84.469L56.798,84.469z M55.199,95.104c-0.346,0.049-0.601,0.179-0.762,0.39 c-0.161,0.211-0.242,0.527-0.242,0.949c0,0.992,0.458,1.487,1.376,1.487c0.595,0,1.178-0.198,1.748-0.596v-2.527L55.199,95.104 L55.199,95.104z M74.895,94.657l0.297,7.81H67.94l0.335-7.065l-0.26-18.557l7.213-0.483L74.895,94.657L74.895,94.657z M93.696,95.178l-9.222,0.075c0.224,0.867,0.646,1.506,1.265,1.914c0.62,0.409,1.475,0.613,2.565,0.613 c1.215,0,2.987-0.31,5.317-0.93l0.521,0.373l-1.115,4.908c-1.958,0.521-3.78,0.781-5.466,0.781c-3.074,0-5.474-0.818-7.195-2.455 c-1.724-1.636-2.585-3.892-2.585-6.768c0-2.852,0.817-5.095,2.455-6.73c1.636-1.637,3.879-2.455,6.73-2.455 c2.453,0,4.356,0.645,5.708,1.935c1.351,1.289,2.026,3.086,2.026,5.392c0,0.744-0.074,1.55-0.224,2.417L93.696,95.178 L93.696,95.178z M88.565,91.087c0-1.313-0.559-1.97-1.674-1.97c-1.363,0-2.193,0.88-2.491,2.64l4.091-0.148L88.565,91.087 L88.565,91.087z M62.769,39.677v12.551h11.26v-0.034c0-3.461-1.416-6.607-3.696-8.889C68.343,41.317,65.699,39.984,62.769,39.677 L62.769,39.677L62.769,39.677z M62.769,54.88v7.792h11.26V54.88H62.769L62.769,54.88L62.769,54.88z M60.118,62.664V54.88H48.856 v7.792h11.261V62.664L60.118,62.664z M60.118,52.229V39.677c-2.937,0.314-5.574,1.64-7.563,3.628 c-2.28,2.282-3.698,5.428-3.698,8.889v0.034H60.118L60.118,52.229L60.118,52.229z M61.443,36.957c4.193,0,8.002,1.716,10.757,4.472 c2.764,2.763,4.473,6.572,4.473,10.758v13.122H46.206V52.187c0-4.193,1.717-8.002,4.472-10.758 C53.441,38.672,57.25,36.957,61.443,36.957L61.443,36.957L61.443,36.957z M93.754,3.552l17.169,0.701V27.44l-17.169-11.33V3.552 L93.754,3.552L93.754,3.552L93.754,3.552z" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            <h1 className="dark:text-white text-4xl font-bold sm:text-5xl">House Is Going?</h1>
                        </div>

                        <div className=" mt-8 w-96 dark:text-white bg-neutral-900 space-y-5 p-4 shadow-xl border rounded-xl  margin-top: 50px">
                            <div className="text-center">
                                <div className="mt-2">
                                    <h3 className="dark:text-white text-xl font-semibold sm:text-2xl">Create a New Account</h3>
                        </div>

                    </div>
                    <form
                        onSubmit={onSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="dark:text-white font-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email} onChange={(e) => { setEmail(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm dark:text-white font-bold">
                                Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete='new-password'
                                required
                                value={password} onChange={(e) => { setPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm dark:text-white font-bold">
                                Confirm Password
                            </label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete='off'
                                required
                                value={confirmPassword} onChange={(e) => { setconfirmPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        {errorMessage && (
                            <span className='text-red-600 font-bold'>{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </button>
                        <div className="text-sm text-center">
                            Already have an account? {'   '}
                            <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Continue</Link>
                        </div>
                    </form>
                    </div>
                </div>
            </main>
            </div>
            <div class="w-1/2 h-screen hidden lg:block">
                <img src="https://i.imgur.com/8tv8G67.jpeg?w=826" alt="Placeholder Image" class="object-cover w-full h-full"></img>
            </div>
        </div>
    )
}

export default Register