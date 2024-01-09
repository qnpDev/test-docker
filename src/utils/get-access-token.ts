import axios from "axios";

const getAccessToken = async () => {
  const res = await axios({
    method: "POST",
    url: "https://zalohelpers.thegioiwhey.com/access-token/json",
    headers: {
      "secret-key": "thegioiwhey@123",
    },
  });
  if (!res.data.access_token) {
    throw Error("Can't not get access_token!");
  }
  return res?.data?.access_token;
};

export default getAccessToken;
