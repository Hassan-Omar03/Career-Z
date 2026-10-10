import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { finishSocialLogin } from '../api/socialAuth';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';
import PageSeo from '../components/PageSeo';
export default function SocialCallback() {
  const [error,setError]=useState('');
  const params=useRef(new URLSearchParams(location.search));
  const request=useRef(null);
  const navigate=useNavigate();
  const {refreshProfile}=useAuth();
  useEffect(()=>{
    let alive=true;
    history.replaceState(null,'','/social-callback');
    if(params.current.get('error')) {setError('Provider sign-in was cancelled or could not be completed. Please try again.');return;}
    request.current ||= finishSocialLogin(params.current.get('ticket'));
    request.current.then(async data=>{
      if(!alive)return;
      if(data.linkRequired){navigate('/login',{replace:true,state:{socialLinkRequired:true}});return;}
      if(data.twoFactorRequired){navigate('/login',{replace:true,state:{socialTwoFactorEmail:data.email}});return;}
      await refreshProfile();if(alive)navigate('/dashboard',{replace:true});
    }).catch(e=>{if(alive)setError(e.message);});
    return()=>{alive=false;};
  },[navigate]);
  return <><PageSeo title="Completing sign-in" description="Secure account sign-in" path="/social-callback" noindex/><AuthNavbar/><main className="public-page"><div className="public-content-card"><h1>{error?'Sign-in needs attention':'Completing sign-in...'}</h1>{error?<><p role="alert">{error}</p><Link className="btn btn-primary" to="/login">Back to sign in</Link></>:<p role="status">Verifying your provider account.</p>}</div></main></>;
}
