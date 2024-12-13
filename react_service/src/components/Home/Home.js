import React, { useEffect, useState } from 'react';

const Home = () => {
	return (
		<div>
		  <iframe src={`${process.env.PUBLIC_URL}/test_fol/test.html`} width="100%" height="500px"></iframe>
		</div>
	  );
};

export default Home;
