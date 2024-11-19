FROM httpd:2.4

RUN sed -i -E 's/(DirectoryIndex index.html)/DirectoryIndex disabled/' /usr/local/apache2/conf/httpd.conf;\
	sed -i -E 's/(<Directory "\/usr\/local\/apache2\/htdocs">)/\1\nIndexIgnore .git* .htaccess .DS_Store\n/' /usr/local/apache2/conf/httpd.conf
