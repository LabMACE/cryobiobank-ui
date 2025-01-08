/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    useAuthProvider,
    useCreate,
    useDataProvider,
    Toolbar,
    SaveButton,
    useRedirect,
    Button,
    TextField,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    NumberInput,
} from 'react-admin';
// import 'react-dropzone-uploader/dist/styles.css'
// import { FilePond, registerPlugin } from 'react-filepond';
// import 'filepond/dist/filepond.min.css';
// import Dropzone from 'react-dropzone-uploader'
import { useState, useEffect, useRef } from 'react';


const SubmissionCreate = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" helperText="Name your submission" validate={[required()]} />
                <TextInput source="comment" />
            </SimpleForm>
        </Create >
    )
};

export default SubmissionCreate;
