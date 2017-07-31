import React from 'react';
import ReactDOM from 'react-dom';
import $ from '../../helper/validator';
import TestWrapper from '../TestWrapper';
import Document from '../../../components/document/Document.jsx';

TestWrapper.componentName = 'Document';

const documentDetail = {
  ownerId: 1,
  permission: 'public',
  title: 'The book of mistery',
  content: 'The content of mistery',
};

const userDetail = {
  userId: 1,
  fullName: 'Jude Admin',
  roleId: 1
};

const deleteDocument = (someDoc) => {
  return Promise.resolve(someDoc);
}

describe('Document Component', () => {
  const wrapper = TestWrapper.mounts(Document,
    { user: userDetail, document: documentDetail, deleteDocument });
  const rendered = TestWrapper.renders(Document,
    { user: userDetail, document: documentDetail }).html();

  describe('When loaded', () => {
    it('should show the title', () => {
      expect(rendered.includes('The book of mistery'));
    });
    it('Should show the view button', () => {
      expect(rendered.includes('<i class="fa fa-eye"></i>')).toBe(true);
    });
    it('Should show a default image', () => {
      expect(rendered.includes('<img src="document.png" alt="document-img">')).toBe(true);
    });
  });

  describe('When user is an admin', () => {
    it('Should show the view button', () => {
      expect(rendered.includes('<i class="fa fa-eye"></i>')).toBe(true);
    });
    it('Should show the edit button', () => {
      expect(rendered.includes('<i class="fa fa-edit"></i>')).toBe(true);
    });

    it('Should show the delete button', () => {
      expect(rendered.includes('i class="fa fa-trash"></i>')).toBe(true);
    });
  });

  describe('When user is the owner', () => {
    userDetail.roleId = 2;
    userDetail.userId = 2;
    documentDetail.ownerId = 2;
      const rendered = TestWrapper.renders(Document,
    { user: userDetail, document: documentDetail }).html();

    it('Should show the view button', () => {
      expect(rendered.includes('<i class="fa fa-eye"></i>')).toBe(true);
    });
    it('Should show the edit button', () => {
      expect(rendered.includes('<i class="fa fa-edit"></i>')).toBe(true);
    });

    it('Should show the delete button', () => {
      expect(rendered.includes('i class="fa fa-trash"></i>')).toBe(true);
    });
  });

  describe('When user is not the owner and its a public document', () => {
    userDetail.roleId = 2;
    userDetail.userId = 2;
    documentDetail.ownerId = 3;
      const rendered = TestWrapper.renders(Document,
    { user: userDetail, document: documentDetail }).html();

    it('Should show the view button', () => {
      expect(rendered.includes('<i class="fa fa-eye"></i>')).toBe(true);
    });
    it('Should hide the edit button', () => {
      expect(rendered.includes('<i class="fa fa-edit"></i>')).toBe(false);
    });

    it('Should hide the delete button', () => {
      expect(rendered.includes('i class="fa fa-trash"></i>')).toBe(false);
    });
  });
});
