import { useEffect } from "react";

const useFavicon = (href: string, type = "image/x-icon") => {
	useEffect(() => {
		let link = document.querySelector(
			"link[rel*='icon']",
		) as HTMLLinkElement | null;

		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}

		link.type = type;
		link.href = href;
	}, [href, type]);
};

export default useFavicon;
