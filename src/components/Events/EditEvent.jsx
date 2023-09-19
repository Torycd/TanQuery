import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { state } = useNavigation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const params = useParams();
  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000
  });
  // For sending post request
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     // this is the new event that is already been edited
  //     const newEvent = data.event;
  //     // this cancels the present query of fetching the event
  //     await queryClient.cancelQueries({
  //       queryKey: ["events", params.id],
  //     });
  //     // this gets the old event ? but why
  //     const previousEvent = queryClient.getQueryData(["events", params.id]);
  //     // this sets the new query with the new event
  //     queryClient.setQueryData(["events", params.id], newEvent);

  //     return { previousEvent };
  //   },

  //   // this onError is very important to get an error and pass the necessary changes to the elemmt that cannot be render
  //   // eslint-disable-next-line no-unused-vars
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", params.id], context.previousEvent);
  //   },
  //   //
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", params.id]);
  //   },
  // });
  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Faild to load events"
          message={
            error.info?.message ||
            "failed to load events please check your input and try again later"
          }
        />
        <Link to="../" className="button">
          okay
        </Link>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          "Submiitng data"
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}

// this makes the data is already loaded before the request for the data, this ehenaces th e
// the speed of the webpage
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}
export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
}
