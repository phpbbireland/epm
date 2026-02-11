# epm (Electronics Parts Manager)
First Web App built with Claude AI

I was just checking out Claude AI and ended up with a simple Web Application to keep track of my parts (see image directory screenshots).  

**Here's the overview...**  
We create a top level Category for each type of type of component/device: Displays, Components, Modules etc...  
Inside each top level category we can add sub-categories which in turn can have sub-categories...  

Example 1: We create a category for Displays inside of which we can have sub-categories for the various types, LCD, TFT, 7 Segement etc...  
Example 2: We create a category for descrete Components with usual sub-categories for Diodes, Caps, Resistors etc..  

Not only do we track quantities but we also store links to: Source / Example Code, Suppliers, Git Repo, Project Folder etc...  
Links to web sources open in browser, links to code if local (on your PC) copy the path to the clipboard for openibg in file manager...  

**Database Storage**  
To store the information we need a local database, this requires running a local server such as XAMPP.  

It's fully functioning as is and include the SQL file to create the database etc...  

![Example Image](https://github.com/phpbbireland/epm/blob/main/images/eppm-image-parts.png)  
Mike
