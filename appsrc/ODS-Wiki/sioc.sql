--
--  $Id$
--
--  This file is part of the OpenLink Software Virtuoso Open-Source (VOS)
--  project.
--
--  Copyright (C) 1998-2006 OpenLink Software
--
--  This project is free software; you can redistribute it and/or modify it
--  under the terms of the GNU General Public License as published by the
--  Free Software Foundation; only version 2 of the License, dated June 1991.
--
--  This program is distributed in the hope that it will be useful, but
--  WITHOUT ANY WARRANTY; without even the implied warranty of
--  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
--  General Public License for more details.
--
--  You should have received a copy of the GNU General Public License along
--  with this program; if not, write to the Free Software Foundation, Inc.,
--  51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
--

use sioc
;

create procedure wiki_post_iri (in cluster_name varchar, in cluster_id int, in localname varchar)
{
  cluster_name := cast (cluster_name as varchar);
  declare owner varchar;
  owner := WV.WIKI.CLUSTERPARAM (cluster_id, 'creator');
  return sprintf ('http://%s%s/%U/wiki/%U/%U', get_cname(), get_base_path (), owner, cluster_name, localname);
}
;

create procedure wiki_post_iri_2 (in _topicid int)
{
  declare _inst, _localname, owner varchar;
  declare _cid int;
  declare exit handler for not found { return null; };
  select top 1 ClusterName, c.ClusterId, Localname into _inst, _cid, _localname
  	 from WV..CLUSTERS c,
	      WV..TOPIC t
      where c.ClusterId = t.ClusterId
       	    and t.TopicId = _topicid;
  owner := WV.WIKI.CLUSTERPARAM (_cid, 'creator', 'dav');
  return sprintf ('http://%s%s/%U/wiki/%U/%U', get_cname(), get_base_path (), owner, _inst, _localname);
}
;

create procedure wiki_comment_iri (in _topicid int, in _comment_id int)
{
  return wiki_post_iri_2 (_topicid) || '/' || cast (_comment_id as varchar);
}
;


create procedure wiki_cluster_iri (in cluster_name varchar)
{
  cluster_name := cast (cluster_name as varchar);
  declare owner varchar;
  owner := WV.WIKI.CLUSTERPARAM (cluster_name, 'creator');
  return sprintf ('http://%s%s/%U/wiki/%U', get_cname(), get_base_path (), owner, cluster_name);
}
;

create procedure user_iri_by_uname (in uname varchar)
{
  return sprintf ('http://%s%s/%U', get_cname(), get_base_path (), uname);
}
;

create procedure fill_ods_wiki_sioc (in graph_iri varchar, in site_iri varchar, in _wai_name varchar := null)
{
  declare iri, c_iri varchar;
  for select c.CLUSTERID as _id, CLUSTERNAME, LOCALNAME, TITLETEXT, U_NAME, U_E_MAIL, T_OWNER_ID, T_CREATE_TIME, T_PUBLISHED, RES_CONTENT, RES_MOD_TIME
    from WV.WIKI.TOPIC t, WV.WIKI.CLUSTERS c, DB.DBA.WA_INSTANCE, WS.WS.SYS_DAV_RES, DB.DBA.SYS_USERS
    where c.CLUSTERID = t.CLUSTERID
      and c.CLUSTERNAME = WAI_NAME
      and ((WAI_IS_PUBLIC = 1 and _wai_name is null) or WAI_NAME = _wai_name)
      and RES_ID = t.RESID
      and U_ID = T_OWNER_ID
   do
    {
      iri := wiki_post_iri (CLUSTERNAME, _id, LOCALNAME);
      c_iri := wiki_cluster_iri (CLUSTERNAME);
      if (iri is not null)
	{
	  ods_sioc_post (graph_iri, 
			 iri, 
			 c_iri, 
			 user_iri_by_uname(U_NAME), 
			 coalesce (TITLETEXT, LOCALNAME), 
			 T_CREATE_TIME, 
			 RES_MOD_TIME, 
			 null, 
			 RES_CONTENT
			 );
        }
    }
}
;

create procedure wiki_sioc_post (inout _topic WV.WIKI.TOPICINFO)
{
  declare graph_iri, iri, c_iri varchar;
  graph_iri := sioc..get_graph ();

  iri := sioc..wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  c_iri := sioc..wiki_cluster_iri (_topic.ti_cluster_name);
  declare cr_time, mod_time datetime;
  select RES_CR_TIME, RES_MOD_TIME into cr_time, mod_time from WS.WS.SYS_DAV_RES where RES_ID = _topic.ti_res_id;
  declare uname varchar;
  uname := (select U_NAME from DB.DBA.SYS_USERS where U_ID = _topic.ti_author_id);
  if (uname is not null)
    uname := sioc..user_iri_by_uname (uname);
  wiki_sioc_post_delete (_topic);
  sioc..ods_sioc_post (graph_iri, 
	iri, 
	c_iri, 
	uname, 
	coalesce (_topic.ti_title_text, _topic.ti_local_name), 
	cr_time, 
	mod_time, 
	null, 
	_topic.ti_text);
  DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('topic'), c_iri);
}
;

create procedure wiki_sioc_post_links_to (inout _topic WV.WIKI.TOPICINFO, inout _tgt WV.WIKI.TOPICINFO)
{
  declare graph_iri  varchar;
  graph_iri := sioc..get_graph ();

  declare tgt_uri, iri varchar;
  iri := sioc..wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  tgt_uri := sioc..wiki_post_iri (_tgt.ti_cluster_name, _tgt.ti_cluster_id, _tgt.ti_local_name);
  if (tgt_uri is not null)
    DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('links_to'), tgt_uri);
}
;

create procedure wiki_sioc_post_links_to_2 (inout _topic WV.WIKI.TOPICINFO, in tgt_uri varchar)
{
  declare graph_iri  varchar;
  graph_iri := sioc..get_graph ();

  declare iri varchar;
  iri := sioc..wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  if (tgt_uri is not null)
    DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('links_to'), tgt_uri);
}
;

create procedure wiki_sioc_attachment (inout _topic WV.WIKI.TOPICINFO, in attachmentname varchar)
{
  declare graph_iri  varchar;
  graph_iri := sioc..get_graph ();

  declare iri varchar;
  iri := sioc..wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  if (attachmentname is not null)
    DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('attachment'), WV.WIKI.SIOC_BASE (_topic.ti_cluster_name) || _topic.ti_local_name || '/' || attachmentname);
}
;

create procedure wiki_sioc_attachment_delete (inout _topic WV.WIKI.TOPICINFO, in attachmentname varchar)
{
  declare graph_iri  varchar;
  graph_iri := sioc..get_graph ();

  declare iri varchar;
  iri := sioc..wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  if (attachmentname is not null)
    delete_quad_s_p_o (graph_iri, iri, sioc_iri ('attachment'), WV.WIKI.SIOC_BASE (_topic.ti_cluster_name) || _topic.ti_local_name || '/' || attachmentname);
}
;


create procedure wiki_sioc_post_delete (inout _topic WV.WIKI.TOPICINFO)
{
  declare graph_iri, iri varchar;
  graph_iri := get_graph ();
  iri := wiki_post_iri (_topic.ti_cluster_name, _topic.ti_cluster_id, _topic.ti_local_name);
  delete_quad_s_or_o (graph_iri, iri, iri);
}
;

create trigger WV_COMMENT_SIOC_D before delete on WV..COMMENT referencing old as O
{
  declare iri varchar;
  declare graph_iri varchar;
  declare exit handler for sqlstate '*' {
    sioc_log_message (__SQL_MESSAGE);
    return;
  };
  graph_iri := get_graph ();
  iri := wiki_comment_iri (O.C_TOPIC_ID, O.C_ID);
  delete_quad_s_or_o (graph_iri, iri, iri);
}
;

create trigger WV_COMMENT_SIOC_I after insert on WV..COMMENT referencing new as N
{
  declare iri, c_iri, cluster_iri varchar;
  declare graph_iri varchar;
  declare exit handler for sqlstate '*' {
    sioc_log_message (__SQL_MESSAGE);
    return;
  };
  if (not exists (select top 1 1 from WV.WIKI.TOPIC t, WV.WIKI.CLUSTERS c, DB.DBA.WA_INSTANCE
     where WAI_NAME = c.CLUSTERNAME and c.CLUSTERID = t.CLUSTERID and t.TOPICID = N.C_TOPIC_ID and WAI_IS_PUBLIC = 1))
   return;
  graph_iri := get_graph ();
  iri := wiki_comment_iri (N.C_TOPIC_ID, N.C_ID);
  c_iri := wiki_post_iri_2 (N.C_TOPIC_ID);
  cluster_iri := wiki_cluster_iri ( (select c.CLUSTERNAME from WV.WIKI.TOPIC t, WV.WIKI.CLUSTERS c where t.CLUSTERID = c.CLUSTERID and t.TOPICID = N.C_TOPIC_ID) );

  if (N.C_HOME is not null)
     foaf_maker (graph_iri, N.C_HOME, N.C_AUTHOR, N.C_EMAIL);
  DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('reply_of'), c_iri);
  DB.DBA.RDF_QUAD_URI (graph_iri, c_iri, sioc..sioc_iri ('has_reply'), iri);
  DB.DBA.RDF_QUAD_URI (graph_iri, cluster_iri, sioc..sioc_iri ('container_of'), iri);
}
;

create procedure fill_comments ()
{
  if ((not isinteger(registry_get ('__wikiv_comments_init')))
	and (registry_get ('__wikiv_comments_init') = '2'))
     return;
  for select C_HOME, C_AUTHOR, C_EMAIL, C_TOPIC_ID as _TOPIC_ID, C_ID as _ID, c.CLUSTERNAME as _cluster from WV.WIKI.COMMENT, WV.WIKI.TOPIC t, WV.WIKI.CLUSTERS c, DB.DBA.WA_INSTANCE
     where WAI_NAME = c.CLUSTERNAME and c.CLUSTERID = t.CLUSTERID and t.TOPICID = C_TOPIC_ID and WAI_IS_PUBLIC = 1 do
  {
    declare iri, c_iri,cluster_iri varchar;
    declare graph_iri varchar;
    
    graph_iri := get_graph ();
    iri := wiki_comment_iri (_TOPIC_ID, _ID);
    c_iri := wiki_post_iri_2 (_TOPIC_ID);
    cluster_iri := wiki_cluster_iri (_cluster);
    delete_quad_s_p_o (graph_iri, cluster_iri, sioc_iri ('container_of'), iri);
    delete_quad_sp (graph_iri, iri, sioc_iri ('reply_of'));
    delete_quad_sp (graph_iri, c_iri, sioc_iri ('has_reply'));

    DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc..sioc_iri ('reply_of'), c_iri);
    DB.DBA.RDF_QUAD_URI (graph_iri, c_iri, sioc..sioc_iri ('has_reply'), iri);
    DB.DBA.RDF_QUAD_URI (graph_iri, cluster_iri, sioc..sioc_iri ('container_of'), iri);
    if (C_HOME is not null)
       foaf_maker (graph_iri, C_HOME, C_AUTHOR, C_EMAIL);
  }

  for select TOPICID, U_NAME from WV.WIKI.TOPIC, DB.DBA.SYS_USERS where U_ID = T_OWNER_ID do 
    {
      declare iri, cr_iri varchar;
      declare graph_iri varchar;
      graph_iri := get_graph ();
      iri := wiki_post_iri_2 (TOPICID);
      cr_iri := user_iri_by_uname(U_NAME);
      delete_quad_s_p_o (graph_iri, iri, sioc_iri ('has_creator'), cr_iri);
      DB.DBA.RDF_QUAD_URI (graph_iri, iri, sioc_iri ('has_creator'), cr_iri);

      delete_quad_s_p_o (graph_iri, cr_iri, sioc_iri ('creator_of'), iri);
      DB.DBA.RDF_QUAD_URI (graph_iri, cr_iri, sioc_iri ('creator_of'), iri);

      delete_quad_s_p_o (graph_iri, iri, foaf_iri ('maker'), person_iri (cr_iri));
      DB.DBA.RDF_QUAD_URI (graph_iri, iri, foaf_iri ('maker'), person_iri (cr_iri));
    }
  -- upgrade is broken, need to find who delete all comments properties. So far this workaround works fine
  registry_set ('__wikiv_comments_init', 'done');
}
;

create procedure attachment_upgrade ()
{
  if ((not isinteger(registry_get ('__wikiv_sioc_attachment_init')))
      and (registry_get ('__wikiv_sioc_attachment_init') = '1'))
     return;
  for select TOPICID, RES_COL, LOCALNAME from WV.WIKI.TOPIC, WS.WS.SYS_DAV_RES where RES_ID = RESID do 
    {
      declare _dav_path varchar;
      _dav_path := DB.DBA.DAV_SEARCH_PATH (RES_COL, 'C') || LOCALNAME || '/';
      if (DB.DBA.DAV_HIDE_ERROR (DB.DBA.DAV_PROP_GET(_dav_path, 'oWiki:topic-id', null, null)) is null)
        {
	  DB.DBA.DAV_PROP_SET_INT(_dav_path,
				  'oWiki:topic-id', serialize (TOPICID),
				  null, null, 0, 1, 1);
	  declare _topic WV.WIKI.TOPICINFO;
	  _topic := WV.WIKI.TOPICINFO();
	  _topic.ti_id := TOPICID;
	  _topic.ti_find_metadata_by_id ();
	  if (_topic.ti_res_id)
	    {
	      declare attachments any;
	      attachments := _topic.ti_report_attachments ();
	      foreach (varchar _name in xpath_eval ('//Attach/@Name', attachments, 0)) do
		{
		  sioc..wiki_sioc_attachment (_topic, _name);
		}
	    }
	}
    }
  registry_set ('__wikiv_sioc_attachment_init', '1');
}
;


create procedure  ods_wiki_sioc_init ()
{
  declare sioc_version any;
  sioc_version := registry_get ('__ods_sioc_version');
  if  (registry_get ('__ods_sioc_init') <>  sioc_version)
    return;
  if  (registry_get ('__ods_wiki_sioc_init') =  sioc_version)
    return;
  fill_ods_wiki_sioc (get_graph (), get_graph  ());
  registry_set  ('__ods_wiki_sioc_init', sioc_version);
}
;


WV.WIKI.SILENT_EXEC('sioc..attachment_upgrade()')
;
WV.WIKI.SILENT_EXEC('sioc..ods_wiki_sioc_init()')
;


use DB
;

registry_set ('__wikiv_sioc_attachment_init', '1')
;

-- sioc related xslt functions

create function WV.WIKI.SIOC_URI(in _cluster_name varchar)
{
  return 'http://' || WA_GET_HOST() || '/dataspace/' || WV.WIKI.CLUSTERPARAM (_cluster_name, 'creator', 'dav') || '/wiki/' || _cluster_name || '/sioc.rdf';
}
;

create function WV.WIKI.SIOC_BASE(in _cluster_name varchar)
{
  return 'http://' || WA_GET_HOST() || '/wiki/main/' || _cluster_name || '/';
}
;


grant execute on WV.WIKI.SIOC_URI to public
;


xpf_extension ('http://www.openlinksw.com/Virtuoso/WikiV/:sioc_uri', 'WV.WIKI.SIOC_URI')
;

wiki_exec_no_error ('drop trigger WV.Wiki.TOPIC_SIOC_I')
;
wiki_exec_no_error ('drop trigger WV.Wiki.TOPIC_SIOC_D')
;
