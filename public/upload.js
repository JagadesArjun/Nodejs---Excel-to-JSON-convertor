'use strict';

const e = React.createElement;

class Upload extends React.Component {
    constructor(props) {
        super(props);

        this.clickedLoad = this.clickedLoad.bind(this);
        this.onImageLoad = this.onImageLoad.bind(this);
    }

    onImageLoad(e) {
        console.log('onImageLoad', e.target.files[0]);
        this.clickedLoad(e.target.files[0]);
    }

    clickedLoad(file) {
        if (file) {
            var formData = new FormData(this.refs.myForm);
            formData.append('file', file);

            fetch("http://localhost:3000/parse", {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log(result)
                    },
                    (error) => {
                        console.log(error)
                    }
                )
        } else {
            console.log('No Files selected');
        }
    }

    render() {

        return (
            React.createElement("div", {},
                React.createElement('input', {type: 'file', onChange: (e) => this.onImageLoad(e)}),
                React.createElement('form', {id: 'upload_form', ref: "myForm", encType: "multipart/form-data"}),
            )
        );
    }
}

const domContainer = document.querySelector('#upload_button_container');
ReactDOM.render(e(Upload), domContainer);