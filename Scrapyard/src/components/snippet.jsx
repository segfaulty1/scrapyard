import React, {useState} from 'react';
import {useContext} from 'react';
import {useEffect} from 'react';
import {GlobalContext} from '../pages/shared/sharedLayout';
import {remove} from '../tools/bridge';
import {deepClone} from '../tools/deepClone';
import Form from './form/form';
import Preview from './preview';

export default function Snippet(props) {
    const whoami = useContext(GlobalContext);

    const [snipInfoState, setSnipInfoState] = useState({
        snippet: props.snippet,
    });
    const [popUpState, setPopUpState] = useState({showForm: false, showPreview: false});

    const fieldsClasses = {
        inputs: 'border-b-2 border-b-lime-600 p-1 outline-lime-300 focus:outline-1 bg-[#181818]',
    };
    const [formFieldsState, setFormFieldsState] = useState({
        fields: [
            {
                type: 'input',
                attr: {
                    key: 'title',
                    defaultValue: snipInfoState.snippet.title,
                    name: 'title',
                    type: 'text',
                    className: fieldsClasses.inputs,
                },
            },
            {
                type: 'textarea',
                attr: {
                    key: 'descr',
                    defaultValue: snipInfoState.snippet.descr,
                    name: 'descr',
                    type: 'textarea',
                    className: fieldsClasses.inputs,
                },
            },
            {
                type: 'Snippet',
                attr: {
                    key: 'Snippet',
                    value: snipInfoState.snippet.snippet,
                },
            },
        ],
    });

    useEffect(() => {
        if (props.user == whoami) {
            const stateCpy = deepClone(formFieldsState);
            stateCpy.fields.push({
                type: 'Coworkers',
                attr: {
                    key: 'coworkers',
                    name: 'coworkers',
                },
            });
            stateCpy.fields.push({
                type: 'IsPrivate',
                attr: {
                    key: 'isPrivate',
                    name: 'isPrivate',
                },
            });
            setFormFieldsState(stateCpy);
        }
    }, []);

    const handlePreview = (e) => {
        e.stopPropagation();
        if (snipInfoState.snippet.allowedActions.includes('read')) {
            setPopUpState({showPreview: true, showForm: false});
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (snipInfoState.snippet.allowedActions.includes('edit')) {
            setPopUpState({showForm: true, showPreview: false});
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (snipInfoState.snippet.allowedActions.includes('delete')) {
            // console.log(snipInfoState.snippet);
            const response = await remove(
                snipInfoState.snippet.user + '/' + snipInfoState.snippet.id
            );
            console.log(response.msg);

            if (response.status == 200) {
                props.updateSnippetsCB();
            }
        }
    };

    const classes = {
        buttons: 'flex justify-between mt-[20px]',
        button: 'w-[100px] leading-8 rounded-md text-white',
        btnPreview: `${
            snipInfoState.snippet.allowedActions.includes('read')
                ? 'bg-cyan-600'
                : 'bg-gray-400 cursor-not-allowed'
        }`,
        btnEdit: `${
            snipInfoState.snippet.allowedActions.includes('edit')
                ? 'bg-lime-600'
                : 'bg-gray-400 cursor-not-allowed'
        }`,
        btnDelete: `${
            snipInfoState.snippet.allowedActions.includes('delete')
                ? 'bg-red-500'
                : 'bg-gray-400 cursor-not-allowed'
        }`,
        private: `pointer-events-none select-none relative 
            after:absolute after:content-["PRIVATE"] after:top-[40%]
            after:left-[34%] after:font-extrabold after:text-red-600
            after:text-2xl after:border-y-[5px] after:border-red-600`,
    };

    const update = () => {
        (async () => {
            const response = await updateSnippet(
                snipInfoState.snippet.user,
                snipInfoState.snippet.id
            );
            if (response) {
                if (response == 'unauthorized') {
                    return changeRoute('/login');
                }
                setSnipInfoState({...snipInfoState, snippet: response});
            }
        })();
    };
    const hidePopUp = (popUp) => {
        let newState = {...popUpState};
        if (popUp == 'form') {
            newState.showForm = false;
        } else {
            newState.showPreview = false;
        }

        setPopUpState(newState);
    };

    return (
        <>
            <div
                data-key={snipInfoState.snippet.id}
                draggable="false"
                className={`border-[1px] border-lime-300`}
            >
                <div className={`snippet flex flex-col w-[360px] p-8`}>
                    <h3 className="text-xl text-gray-300 mb-3">{snipInfoState.snippet.title}</h3>
                    <div>
                        <p>
                            status:&nbsp;
                            <span className="text-gray-500">
                                {snipInfoState.snippet.isPrivate ? 'private' : 'public'}
                            </span>
                        </p>
                        <p>
                            allowed actions:&nbsp;
                            <span className="text-gray-500">
                                {snipInfoState.snippet.allowedActions.reduce(
                                    (acc, action) => acc + ' | ' + action
                                )}
                            </span>
                        </p>
                    </div>
                    <div className={classes.buttons}>
                        <button
                            onClick={handlePreview}
                            className={`${classes.button} ${classes.btnPreview}`}
                        >
                            Preview
                        </button>

                        <button
                            onClick={handleEdit}
                            className={`${classes.button} ${classes.btnEdit}`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className={`${classes.button} ${classes.btnDelete} `}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            {popUpState.showForm ? (
                <Form
                    action="edit"
                    fields={formFieldsState.fields}
                    updateSnippetCB={update}
                    hidePopUp={hidePopUp}
                    snipId={snipInfoState.snippet.id}
                    snipUser={snipInfoState.snippet.user}
                />
            ) : (
                <></>
            )}
            {popUpState.showPreview ? (
                <Preview
                    hidePopUp={hidePopUp}
                    data={{
                        title: snipInfoState.snippet.title,
                        descr: snipInfoState.snippet.descr,
                        snippet: snipInfoState.snippet.snippet,
                    }}
                />
            ) : (
                <></>
            )}
        </>
    );
}
