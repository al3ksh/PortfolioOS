# Portfolio OS - Frontend
FROM nginx:alpine

# Copy static files
COPY *.html robots.txt sitemap.xml /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY og-image.png /usr/share/nginx/html/og-image.png

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
