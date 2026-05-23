import { Link } from 'react-router-dom';
import { Mail, MapPin, Youtube, Linkedin, Instagram } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-crust border-t border-black/10 dark:border-white/10 pt-16 pb-8">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Footer Menus (Left Corner) */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Explore */}
              <div>
                <h4 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-4 h-1 bg-warning"></span> Explore
                </h4>
                <ul className="space-y-3 text-sm text-text-muted">
                  <li><Link to="/courses" className="hover:text-warning transition-colors">All Courses</Link></li>
                  <li><Link to="/cases" className="hover:text-warning transition-colors">Case Studies</Link></li>
                  <li><Link to="/careers" className="hover:text-warning transition-colors">Career Pathways</Link></li>
                  <li><Link to="/community" className="hover:text-warning transition-colors">Community Forum</Link></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-4 h-1 bg-warning"></span> Services
                </h4>
                <ul className="space-y-3 text-sm text-text-muted">
                  <li><Link to="/services" className="hover:text-warning transition-colors">Workshops</Link></li>
                  <li><Link to="/services" className="hover:text-warning transition-colors">Certifications</Link></li>
                  <li><Link to="/about" className="hover:text-warning transition-colors">About Us</Link></li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <span className="w-4 h-1 bg-warning"></span> Contact
              </h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-warning shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span>support@forenclue.in</span>
                    <span>forenclue@gmail.com</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-warning shrink-0 mt-0.5" />
                  <span>Pune, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Logo Section (Middle) */}
          <div className="lg:col-span-1 flex flex-col items-center text-center">
            <Link to="/" className="group mb-6 flex flex-col items-center">
              <Logo className="justify-center" />
              <span className="text-[9px] text-text-muted uppercase tracking-widest mt-1 block group-hover:text-warning transition-colors">Your Partner in Forensic Precession.</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-sm text-center">
              India's First Dedicated Forensic EdTech Platform. Empowering the next generation of forensic experts.
            </p>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/forenclue" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-text-muted hover:text-warning hover:bg-black/5 dark:bg-white/5 transition-colors">
                <Youtube size={18} />
              </a>
              <a href="https://www.linkedin.com/company/foren-clue" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-text-muted hover:text-warning hover:bg-black/5 dark:bg-white/5 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://www.instagram.com/forenclue/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-text-muted hover:text-warning hover:bg-black/5 dark:bg-white/5 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Empty Right Section to ensure exact middle alignment */}
          <div className="lg:col-span-1 hidden lg:block"></div>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} ForenClue. All rights reserved.</p>
          <div className="flex gap-4">
            <Link className="border-b border-transparent hover:border-text-muted hover:text-text-main transition-all" to="/privacy">Privacy Policy</Link>
            <Link className="border-b border-transparent hover:border-text-muted hover:text-text-main transition-all" to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
