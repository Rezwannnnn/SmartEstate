import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

// Small inline SVG icons live here so this page feels alive.
const IconUser = () => (
	<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
		<circle cx="12" cy="8" r="4" />
		<path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" />
	</svg>
);

const IconChevron = () => (
	<svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
	</svg>
);

const IconPin = () => (
	<svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" />
		<circle cx="12" cy="8" r="2" />
	</svg>
);

const IconHome = () => (
	<svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
	</svg>
);

const IconMoney = () => (
	<svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" />
		<path strokeLinecap="round" d="M12 6v1.5M12 16.5V18M9 12a3 3 0 006 0 3 3 0 00-6 0z" />
	</svg>
);

const IconArrow = () => (
	<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
	</svg>
);

const IconMapSearch = () => (
	<svg width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 11a3 3 0 100-6 3 3 0 000 6z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M9 2C5.134 2 2 5.134 2 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
		<circle cx="18.5" cy="18.5" r="2.5" />
		<path strokeLinecap="round" d="M21 21l-1.2-1.2" />
	</svg>
);

const IconPeople = () => (
	<svg width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
		<circle cx="9" cy="7" r="3" />
		<circle cx="17" cy="9" r="2.5" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
		<path strokeLinecap="round" d="M17 14c2.21.502 4 2.24 4 4.5" />
	</svg>
);

// Tiny fade-in helper used by sections as they enter the viewport.
function useFadeIn() {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => { if (e.isIntersecting) setVisible(true); },
			{ threshold: 0.08 }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);
	return [ref, visible];
}

// Top navigation bar.
function Navbar({ scrolled }) {
	const location = useLocation();
	const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));

	useEffect(() => {
		setIsAuthenticated(Boolean(localStorage.getItem("token")));
	}, [location]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsAuthenticated(false);
	};

	const links = [
		{ key: "home", label: "Home", to: "/" },
		{ key: "buy", label: "Buy", to: "/properties" },
		{ key: "rent", label: "Rent", to: "/properties?listing=rent" },
		{ key: "alerts", label: "Alerts", to: "/dashboard?tab=alerts" },
		{ key: "dashboard", label: "Dashboard", to: "/dashboard" },
	];

	const params = new URLSearchParams(location.search);
	const listing = params.get("listing");
	const tab = params.get("tab");

	const isActiveLink = (key) => {
		if (key === "home") return location.pathname === "/";
		if (key === "buy") return location.pathname.startsWith("/properties") && listing !== "rent";
		if (key === "rent") return location.pathname.startsWith("/properties") && listing === "rent";
		if (key === "alerts") return location.pathname === "/dashboard" && tab === "alerts";
		if (key === "dashboard") return location.pathname === "/dashboard" && !tab;
		return false;
	};

	return (
		<nav style={{
			position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
			height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
			padding: "0 60px",
			background: scrolled ? "rgba(248,250,252,0.76)" : "rgba(255,255,255,0.94)",
			backdropFilter: "blur(12px)",
			borderBottom: "1px solid rgba(148,163,184,0.22)",
			boxShadow: scrolled ? "0 10px 30px rgba(15,23,42,0.08)" : "0 2px 10px rgba(15,23,42,0.04)",
			transition: "all 0.35s ease",
		}}>
			<Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#0f172a", letterSpacing: "-0.3px", textDecoration: "none" }}>
				SmartEstate
			</Link>
			<ul style={{ display: "flex", alignItems: "center", gap: 28, listStyle: "none" }}>
				{links.map(link => {
					const isActive = isActiveLink(link.key);

					return (
					<li key={link.key}>
						<Link to={link.to} style={{
							fontFamily: "'DM Sans', sans-serif",
							fontSize: 14,
							fontWeight: isActive ? 600 : 400,
							color: isActive ? "#0f172a" : "#64748b",
							textDecoration: "none",
							paddingBottom: 6,
							borderBottom: isActive ? "2px solid #0f172a" : "2px solid transparent",
							transition: "all 0.22s ease",
						}}>{link.label}</Link>
					</li>
					);
				})}
			</ul>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<button style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e2e8f0", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
					<IconUser />
				</button>
				{!isAuthenticated ? (
					<Link to="/login" style={{ background: "#0f172a", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", textDecoration: "none", boxShadow: "0 8px 20px rgba(15,23,42,0.22)" }}>
						Log in
					</Link>
				) : (
					<button onClick={handleLogout} style={{ background: "#0f172a", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", boxShadow: "0 8px 20px rgba(15,23,42,0.22)" }}>
						Log out
					</button>
				)}
			</div>
		</nav>
	);
}

// Hero section search card block.
function SearchCard() {
	const fields = [
		{ label: "Location",      icon: <IconPin />,   value: "Gulshan" },
		{ label: "Property Type", icon: <IconHome />,  value: "Rent" },
		{ label: "Price Range",   icon: <IconMoney />, value: "50k – 1Cr" },
	];
	return (
		<div style={{ background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)", borderRadius: 20, padding: "30px 26px 26px", width: 360, flexShrink: 0, border: "1px solid rgba(148,163,184,0.28)", boxShadow: "0 24px 70px rgba(15,23,42,0.24)" }}>
			<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4, lineHeight: 1.4 }}>
				Property Deals tailored for you!
			</p>
			<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748b", marginBottom: 24 }}>
				Please fill these details
			</p>
			{fields.map(({ label, icon, value }) => (

				<div key={label} style={{ marginBottom: 14 }}>
					<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: "#9ca3af", marginBottom: 6, letterSpacing: "0.04em" }}>
						{label}
					</p>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 30, background: "#ffffff", cursor: "pointer" }}>
						<span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#374151" }}>
							{icon}{value}
						</span>
						<IconChevron />
					</div>
				</div>
			))}

			<button style={{ width: "100%", height: 46, marginTop: 8, background: "#0f172a", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 30, cursor: "pointer", boxShadow: "0 10px 20px rgba(15,23,42,0.28)" }}>
				Search Properties
			</button>
		</div>
	);
}

// Large featured property card.
function BigPropertyCard() {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{ borderRadius: 16, overflow: "hidden", position: "relative", cursor: "pointer", height: "100%", border: "1px solid rgba(148,163,184,0.22)", boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }}
		>
			<img
				src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
				alt="Modern 3 BHK Apartment"
				style={{ width: "100%", height: "100%", minHeight: 360, objectFit: "cover", display: "block", transition: "transform 0.5s ease", transform: hovered ? "scale(1.04)" : "scale(1)" }}
			/>
			<div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,10,24,0.9) 0%, rgba(6,10,24,0.35) 50%, transparent 100%)" }} />
			<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
				<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Modern 3 BHK Apartment</p>
				<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Gulshan, Dhaka</p>
				<div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
					{[["🛏", "3 Beds"], ["🚿", "3 Baths"], ["📐", "1430 sq ft"]].map(([ic, txt]) => (
						<span key={txt} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
							<span>{ic}</span>{txt}
						</span>
					))}
				</div>

				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#0f172a", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>
						View Details <span>→</span>
					</button>
					<span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>$ 1,25,00,000</span>
				</div>
			</div>
		</div>
	);
}

// Smaller property card used in the right columns.
function SmallPropertyCard({ name, location, img }) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(148,163,184,0.2)", background: "#fff", cursor: "pointer", boxShadow: hovered ? "0 16px 34px rgba(15,23,42,0.12)" : "0 4px 16px rgba(15,23,42,0.05)", transform: hovered ? "translateY(-4px)" : "translateY(0)", transition: "box-shadow 0.25s, transform 0.25s" }}
		>
			<div style={{ overflow: "hidden", height: 220 }}>
				<img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
			</div>
			<div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
				<div>
					<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>{name}</p>
					<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8" }}>{location}</p>
				</div>
				<button style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#374151" }}>
					<IconArrow />
				</button>
			</div>
		</div>
	);
}

// Reusable card for the "How it works" section.
function HowCard({ num, icon, title, desc }) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{ background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)", borderRadius: 18, padding: "24px 24px 30px", border: "1px solid rgba(148,163,184,0.22)", position: "relative", boxShadow: hovered ? "0 16px 32px rgba(15,23,42,0.11)" : "0 6px 14px rgba(15,23,42,0.05)", transition: "box-shadow 0.20s" }}
		>
			<span style={{ position: "absolute", top: 18, right: 18, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: "#94a3b8", border: "1px solid #e5e7eb", borderRadius: 20, padding: "2px 10px", background: "#fff" }}>
				{num}
			</span>
			<div style={{ color: "#1e293b", marginBottom: 40, marginTop: 8 }}>{icon}</div>
			<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{title}</p>
			<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{desc}</p>
		</div>
	);
}

// Main homepage component.
export default function SmartEstatePage() {
	const [scrolled, setScrolled] = useState(false);
	const [featRef, featVisible] = useFadeIn();
	const [howRef, howVisible] = useFadeIn();
	const [ctaRef, ctaVisible] = useFadeIn();

	useEffect(() => {
		const fn = () => setScrolled(window.scrollY > 8);
		window.addEventListener("scroll", fn);
		return () => window.removeEventListener("scroll", fn);
	}, []);

	const fadeStyle = (visible) => ({
		opacity: visible ? 1 : 0,
		transform: visible ? "translateY(0)" : "translateY(24px)",
		transition: "opacity 0.65s ease, transform 0.65s ease",
	});

	return (
		<>
			<style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{font-family:'DM Sans',sans-serif;background:#fff;}`}</style>

			<div style={{ background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 52%,#ffffff 100%)", minHeight: "100vh" }}>
				<Navbar scrolled={scrolled} />

				{/* Hero section with background image and the search card */}
				<section style={{ marginTop: 64, position: "relative", height: 620, overflow: "hidden" }}>
					<img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=85" alt="hero"
						style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
					<div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(2,6,23,0.8) 24%, rgba(2,6,23,0.2) 72%)" }} />
					<div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 38%, rgba(148,163,184,0.22), transparent 42%)" }} />
					{/* Hero content wrapper: headline on left, search card on right */}
					<div style={{ position: "relative", zIndex: 2, height: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
						<div style={{ maxWidth: 600 }}>
							<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.78)", marginBottom: 14 }}>
								Curated Residences
							</p>
							<h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1.12, marginBottom: 16, letterSpacing: "-0.02em" }}>
								Find Your Perfect<br />Property with Confidence
							</h1>
							<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.74)", lineHeight: 1.7, maxWidth: 380 }}>
								Discover homes for sale or rent, explore locations on the map, and manage your property journey with ease.
							</p>
						</div>
						<SearchCard />
					</div>
				</section>

				{/* Featured properties section */}
				<section ref={featRef} style={{ ...fadeStyle(featVisible), padding: "84px 60px" }}>
					<div style={{ maxWidth: 1200, margin: "0 auto" }}>
					<div style={{ textAlign: "right", marginBottom: 40 }}>
						<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
							Editor's Picks
						</p>
						<h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
							Featured Properties
						</h2>
						<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#94a3b8", lineHeight: 1.65, maxWidth: 450, marginLeft: "auto" }}>
							Discover homes for sale or rent, explore locations on the map,<br />and manage your property journey with ease.
						</p>
					</div>
					{/* Property grid: one large card + two compact cards */}
					<div style={{ display: "grid", gridTemplateColumns: "5fr 3fr 3fr", gap: 24, alignItems: "start" }}>
						<BigPropertyCard />
						<SmallPropertyCard name="Modern 2 BHK Apartment" location="Gulshan, Dhaka" img="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" />
						<SmallPropertyCard name="Modern 4 BHK Apartment" location="Banani, Dhaka"  img="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80" />
					</div>
					</div>
				</section>

				{/* How SmartEstate works section */}
				<section ref={howRef} style={{ ...fadeStyle(howVisible), background: "#ffffff", padding: "76px 60px" }}>
					<div style={{ maxWidth: 1200, margin: "0 auto" }}>
						<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
							Process
						</p>
						<h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 32 }}>
							How SmartEstate Works
						</h2>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
							<HowCard num="01" icon={<IconMapSearch />} title="Search & Explore"
								desc="Discover homes for sale or rent, explore locations on the map, and manage your property journey with ease." />
							<HowCard num="02" icon={<IconPeople />} title="Connect & Make an Offer"
								desc="Discover homes for sale or rent, explore locations on the map, and manage your property journey with ease." />
						</div>
					</div>
				</section>

				{/* CTA banner section */}
				<div ref={ctaRef} style={{ ...fadeStyle(ctaVisible), padding: "72px 60px" }}>
					<div style={{ background: "linear-gradient(135deg,#0b1324 0%,#131f36 100%)", borderRadius: 24, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden", maxWidth: 1200, margin: "0 auto", border: "1px solid rgba(148,163,184,0.18)", boxShadow: "0 20px 50px rgba(2,6,23,0.35)" }}>
						<div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 50%, rgba(59,130,246,0.08), transparent 55%), radial-gradient(ellipse at 75% 50%, rgba(99,102,241,0.07), transparent 55%)", pointerEvents: "none" }} />
						<h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.35, maxWidth: 580, margin: "0 auto 16px", position: "relative" }}>
							Transfer Vision into reality, blending the etheral beauty of the tangible strength of architecture
						</h2>
						<p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 32px", position: "relative" }}>
							Discover homes for sale or rent, explore locations on the map, and manage your property journey with ease. Discover homes for sale or rent, explore locations on the map, and manage your property journey with ease.
						</p>
						<button
							style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, padding: "11px 28px", borderRadius: 30, border: "1.5px solid rgba(255,255,255,0.35)", cursor: "pointer", position: "relative" }}
							onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
							onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
						>
							Join us Now →
						</button>
					</div>
				</div>

				{/* Simple footer links */}
				<footer style={{ borderTop: "1px solid #f1f5f9", padding: "24px 60px", display: "flex", justifyContent: "center", gap: 48 }}>
					{["About SmartEstate", "Contact Us", "Terms of Service", "Privacy Policy"].map(l => (
						<a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
							onMouseEnter={e => e.currentTarget.style.color = "#374151"}
							onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
						>{l}</a>
					))}
				</footer>
			</div>
		</>
	);
}
