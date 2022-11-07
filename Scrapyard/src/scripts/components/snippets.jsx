import React, {useState, useEffect} from 'react';
import Snippet from '../components/snippet';
// import {useNavigate, useMatch} from 'react-location';
import {useParams, useOutletContext} from 'react-router-dom';
import Form from '../components/form/form';

import {commonSnippetFields, getSnippets} from '../tools/snipStore';
import {useNavigate} from 'react-router-dom';
import {useQuery} from 'react-query';
import debouncer from '../tools/debouncer';

export default function Snippets() {
    const navigate = useNavigate();

    const {whoami} = useOutletContext();
    // if (whoami == '' || whoami == 'unauthorized') {
    //     console.log(whoami);
    //     return navigate('/login', {replace: true});
    // }

    const {user: userParam} = useParams();

    const [searchState, setSearchState] = useState({title: ''});

    const [popUpState, setPopUpState] = useState({
        showForm: false,
        showPreview: false,
    });
    const {
        refetch: snippetsRefetch,
        data: snippets,
        status,
        error,
    } = useQuery(['snippets'], () => {
        return getSnippets({user: userParam, title: searchState.title});
    });

    const handleSearch = (e) => {
        e.preventDefault();

        debouncer.run('snippetsSearch', e.target.value);
    };

    useEffect(() => {
        debouncer.init(
            'snippetsSearch',
            (title) => {
                setSearchState({title: title});
            },
            500
        );

        return () => {
            debouncer.clear('snippetsSearch');
        };
    }, []);

    useEffect(() => {
        // console.log('refetching');
        snippetsRefetch();
    }, [userParam, searchState.title]);

    // console.log(snippets);
    if (error?.req?.status == 401) {
        return navigate('/login', {replace: true});
    }

    const [formFieldsState] = useState({
        fields: Object.values(structuredClone({commonSnippetFields}))[0],
    });

    // snippetsRefetch();

    // console.log(commonSnippetFields);

    const handleCreate = (e) => {
        e.stopPropagation();
        e.preventDefault();
        //mount form

        setPopUpState({...popUpState, showForm: true});
    };

    const listSnippets = (snippets) => {
        // console.log(status);
        return snippets.map((snippet) => {
            return (
                <Snippet
                    whoami={whoami}
                    key={snippet.id}
                    snippet={snippet}
                    update={() => {
                        // console.log('hhh');
                        snippetsRefetch();
                    }}
                />
            );
        });
    };

    const hidePopUp = (popUp) => {
        let newState = {...popUpState};
        if (popUp == 'form') {
            newState.showForm = false;
        } else {
            newState.showPreview = false;
        }

        snippetsRefetch();

        setPopUpState(newState);
    };

    return status == 'success' ? (
        <div className="flex flex-col items-center justify-stretch px-3 gap-7 mx-auto">
          <div className='w-full max-w-[600px] flex justify-between flex-wrap my-5 gap-4'>

            {
              whoami == userParam || snippets.genericAccess?.create || !userParam ? (
                <button
                    onClick={handleCreate}
                    className={`border-[1px] border-lime-300 px-2 py-2 text-[1rem] text-lime-300 rounded-md`}
                >
                    Add Snippet
                </button>
              ) : (
                  <></>
              )
            }


            <label className=''>
                <input
                    type="text"
                    onChange={handleSearch}
                    placeholder="find your sippet"
                    className="w-full max-w-[260px] px-3 py-2 border-[1px] border-primary rounded-md"
                />
            </label>

          </div>
            {listSnippets(snippets.snippets)}

            {popUpState.showForm ? (
                <Form
                    action="create"
                    fields={formFieldsState.fields}
                    hidePopUp={hidePopUp}
                    owner={userParam}
                />
            ) : (
                <></>
            )}
        </div>
    ) : (
        <></>
    );
}
