// import {Router, Outlet, ReactLocation} from 'react-location';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import React from 'react';
import SharedLayout from './pages/shared/sharedLayout';
import Signin from './pages/signin';
import SignUp from './pages/signup';
import Home from './pages/home';
import Profile from './pages/profile';
import AddRules from './pages/coworkerRules';
import {QueryClient, QueryClientProvider} from 'react-query';

const NotFountPage = ()=><section className={'h-[100vh] flex justify-center items-center'}><p className={'text-2xl text-primary'}>Nothing To See Here (404)</p></section>

function App() {
    const client = new QueryClient({defaultOptions: {queries: {refetchOnWindowFocus: false}}});

    return (
        <QueryClientProvider client={client}>
            <div className='h-[calc(100vh-70px)]'>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<SharedLayout />}>
                            <Route index element={<Home />} />
                            <Route path='/login' element={<Signin />} />
                            <Route path='/signup' element={<SignUp />} />
                            <Route path='/addRules' element={<AddRules />} />
                            <Route path='/user/:user' element={<Profile />} />
                            <Route path='*' element={<NotFountPage/>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </QueryClientProvider>
    );
}

export default App;
