# Project Title

Agricultural Organizations in the Web


## Description

This project serves to get a better understanding of agricultural networks. It does so by analyising and displaying webrelations of websites, containing agricultural content. The project consists of two parts: A crawler and a react based website. 

The crawler starts on an choosen agricultural website. It then searches for external links on this website (depht=1). It continues the with testing the external links. If they lead to a website, which contains a specified domain ending (e.g. "ch") and which home domain contains one of the keywords (e.g. "agriculture") it continues crawling on that website. 

The react based website runs a graphology sigma.js graphical display of the identified websites and its interlinkages. 

The current version of the project is specified to crawl and display the websites of suisse agricultural organizations. 

!!! If you inted to adopt this project to analyse the webscape of another region/nationstate: Test intensively if the functions which are supposed to make it gentle propperly work: the crawler should be slow (sleep time) in order not to steel website's server capacities from actual users. The crawler does not go into depht. Important links to other websites shall be found, not all links. The crawler should ignora pictures, videos and pdfs. And the crawler should check robot.txt and ignore subsites which are not supposed to be crawled.

## Getting Started

### Dependencies

The crawler: All required packages are available in python version 3.12.1:
*  bs4
* chardet
* networkx
* Jinja2
* os
* lxml

The website: Required packages for creating the website were installed locally via npm: 

* "@react-sigma/core": "^5.0.2",
* "@react-sigma/graph-search": "^5.0.3",
* "@react-sigma/layout-forceatlas2": "^5.0.2",
* "graphology": "^0.25.4",
* "graphology-layout": "^0.6.1",
* "graphology-layout-forceatlas2": "^0.10.1",
* "graphology-types": "^0.24.8",
* "react": "^19.0.0",
* "react-dom": "^19.0.0",
* "react-scripts": "^5.0.1",
* "sigma": "^3.0.1"

### Executing program

If you want to run the crawler for comprehending another nations agricultural webscape: First: adopt keywords, the country specifc domain ending, and websites which are not supposed to be crawled (e.g. newspapers) in the Agrarorga.ipynb file. Then test the crawler intesnively and adopt the keyword list and the exclision list. Only then let it run in python. When the crawler has finished or is stopped intentionately, run the second cell of the ipynb file. Then install the sigma graphology and react requirements in terminal via npm. Run npm start to host the website locally. 


## Authors

this project was created by Moritz Maurer, 
* www.linkedin.com/in/moritz-maurer-agriculturalsociologist
* agriculturalwebscapes@protonmail.com



## Version History

* 0.1


## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007 License - see the LICENSE file for details


## Acknowledgements

This project uses the following open-source libraries and tools:

- **React**: A JavaScript library for building user interfaces. [React License](https://github.com/facebook/react/blob/main/LICENSE)
- **Graphology**: A robust and multipurpose JavaScript graph library. [Graphology License](https://github.com/graphology/graphology/blob/master/LICENSE)
- **Sigma.js**: A JavaScript library dedicated to graph drawing. [Sigma.js License](https://github.com/jacomyal/sigma.js/blob/main/LICENSE)
- **Beautiful Soup**: A Python library for parsing HTML and XML documents. [Beautiful Soup License](https://www.crummy.com/software/BeautifulSoup/#Download)
- **Requests**: A simple HTTP library for Python. [Requests License](https://github.com/psf/requests/blob/main/LICENSE)
- **Pandas**: A data manipulation and analysis library for Python. [Pandas License](https://github.com/pandas-dev/pandas/blob/main/LICENSE)
- **lxml**: A library for processing XML and HTML in Python. [lxml License](https://github.com/lxml/lxml/blob/master/LICENSE.txt)
