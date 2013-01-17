$(document).ready(function()
{
	$("img#btnTopNavSearch").click(function()
	{
		$("form#headerSearchFrm").submit();
	});
	
	$("input#txtSearch").click(function()
	{
		if($(this).val() == "Find it here...")
		{
			$(this).val("");
		}
	});
	
	$("input#txtSearch").focusout(function()
	{
		if( $.trim($(this).val()) == "")
		{
			$(this).val("Find it here...");
		}
	});
	
	$("input#subscribeFullname").click(function()
	{
		if($(this).val() == "Full Name")
		{
			$(this).val("");
		}
	});	
	$("img#btnFooterSubscribe").click(function()
	{
		$("form#subscribeFrm").submit();
	});
	
	$("input#subscribeFullname").click(function()
	{
		if($(this).val() == "Full Name")
		{
			$(this).val("");
		}
	});
	$("input#subscribeFullname").focusout(function()
	{
		if( $.trim($(this).val()) == "")
		{
			$(this).val("Full Name");
		}
	});
	
	$("input#subscribeLogin").click(function()
	{
		if($(this).val() == "Email Address")
		{
			$(this).val("");
		}
	});
	$("input#subscribeLogin").focusout(function()
	{
		if( $.trim($(this).val()) == "")
		{
			$(this).val("Email Address");
		}
	});	
	
	$("a#btnSocialFacebook, a#btnSocialTwitter, a#btnSocialYoutube, a#btnSocialMail").mouseover(function()
	{
		$(this).css("top","90px");
	});
	$("a#btnSocialFacebook, a#btnSocialTwitter, a#btnSocialYoutube, a#btnSocialMail").mouseout(function()
	{
		$(this).css("top","94px");
	});	
	$("div#navContent ul li").mouseover(function()
	{
		$(this).css("border-top","2px solid #3c0000");
		$(this).css("border-left","2px solid #3c0000");
		$(this).css("border-right","2px solid #a31313");
		$(this).css("border-bottom","2px solid #9a4646");
		$(this).css("height","46px");
		$(this).css("background","url('site/images/background-nav-active.png')");
		/*$(this).css("padding-left","18px");
		$(this).css("padding-right","18px");*/
		$(this).css("padding-left","8px");
		$(this).css("padding-right","8px");			
		$(this).find("a").css("top","15px");
		//$(this).find("div.subMenu").show();
	});
	$("div#navContent ul li").mouseout(function()
	{
		$(this).removeAttr("style");
		$(this).find("a").removeAttr("style");	
		//$(this).find("div.subMenu").hide();	
	});
});