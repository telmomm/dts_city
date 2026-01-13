import React, { Component } from 'react';

class Footer extends Component {
    render() {
        return (
            <footer>
            <div>
                <p>&copy; {new Date().getFullYear()} - DIGITAL TWIN SOLUTIONS</p>
            </div>
            </footer>
        );
    }
}

export default Footer;
